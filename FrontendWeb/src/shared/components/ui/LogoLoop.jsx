import { useEffect, useMemo, useRef, useState, memo } from 'react';

const cx = (...parts) => parts.filter(Boolean).join(' ');

const toPx = (value) => (typeof value === 'number' ? `${value}px` : value);

const DEFAULTS = {
  minCopies: 2,
  headroom: 2,
};

const useResize = (onResize, refs, deps) => {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const callback = () => onResize();

    if (!window.ResizeObserver) {
      window.addEventListener('resize', callback);
      callback();
      return () => window.removeEventListener('resize', callback);
    }

    const observers = refs.map((ref) => {
      if (!ref.current) return null;
      const observer = new ResizeObserver(callback);
      observer.observe(ref.current);
      return observer;
    });

    callback();

    return () => observers.forEach((observer) => observer?.disconnect());
  }, [onResize, refs, deps]);
};

const useLoopAnimation = (trackRef, targetVelocity, seqSize, isHovered, hoverSpeed, isVertical) => {
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (seqSize > 0) {
      offsetRef.current = ((offsetRef.current % seqSize) + seqSize) % seqSize;
      track.style.transform = isVertical
        ? `translate3d(0, ${-offsetRef.current}px, 0)`
        : `translate3d(${-offsetRef.current}px, 0, 0)`;
    }

    if (prefersReduced) {
      track.style.transform = 'translate3d(0, 0, 0)';
      return () => {
        lastTimeRef.current = null;
      };
    }

    const animate = (timestamp) => {
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp;

      const delta = Math.max(0, timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      const target = isHovered && hoverSpeed !== undefined ? hoverSpeed : targetVelocity;
      velocityRef.current += (target - velocityRef.current) * 0.08;

      if (seqSize > 0) {
        let nextOffset = offsetRef.current + velocityRef.current * delta;
        nextOffset = ((nextOffset % seqSize) + seqSize) % seqSize;
        offsetRef.current = nextOffset;

        track.style.transform = isVertical
          ? `translate3d(0, ${-offsetRef.current}px, 0)`
          : `translate3d(${-offsetRef.current}px, 0, 0)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimeRef.current = null;
    };
  }, [trackRef, targetVelocity, seqSize, isHovered, hoverSpeed, isVertical]);
};

const LogoLoop = memo(({
  logos,
  speed = 120,
  direction = 'left',
  width = '100%',
  logoHeight = 36,
  gap = 20,
  hoverSpeed = 0,
  fadeOut = false,
  fadeOutColor,
  scaleOnHover = false,
  renderItem,
  ariaLabel = 'Logos destacados',
  className,
  style,
}) => {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const seqRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [seqWidth, setSeqWidth] = useState(0);
  const [seqHeight, setSeqHeight] = useState(0);
  const [copyCount, setCopyCount] = useState(DEFAULTS.minCopies);

  const isVertical = direction === 'up' || direction === 'down';

  const targetVelocity = useMemo(() => {
    const magnitude = Math.abs(speed);
    const verticalDirection = direction === 'up' ? 1 : -1;
    const horizontalDirection = direction === 'left' ? 1 : -1;
    const flow = isVertical ? verticalDirection : horizontalDirection;
    return speed < 0 ? -magnitude * flow : magnitude * flow;
  }, [speed, direction, isVertical]);

  const updateSizes = () => {
    const container = containerRef.current;
    const seq = seqRef.current;
    if (!container || !seq) return;

    const rect = seq.getBoundingClientRect();
    const availableWidth = container.clientWidth;
    const availableHeight = container.clientHeight || container.parentElement?.clientHeight || 0;

    if (isVertical) {
      if (rect.height > 0) {
        setSeqHeight(Math.ceil(rect.height));
        setCopyCount(Math.max(DEFAULTS.minCopies, Math.ceil(availableHeight / rect.height) + DEFAULTS.headroom));
      }
    } else if (rect.width > 0) {
      setSeqWidth(Math.ceil(rect.width));
      setCopyCount(Math.max(DEFAULTS.minCopies, Math.ceil(availableWidth / rect.width) + DEFAULTS.headroom));
    }
  };

  useResize(updateSizes, [containerRef, seqRef], [logos, gap, logoHeight, isVertical]);

  useLoopAnimation(trackRef, targetVelocity, isVertical ? seqHeight : seqWidth, isHovered, hoverSpeed, isVertical);

  const rootStyle = useMemo(() => ({
    width: toPx(width) ?? '100%',
    ...style,
  }), [width, style]);

  const renderLogoItem = (item, key) => {
    const itemContent = renderItem ? renderItem(item, key) : (() => {
      if (item.node) return item.node;
      return (
        <img
          src={item.src}
          alt={item.alt || item.title || 'Logo'}
          className="h-[var(--logoloop-logoHeight)] w-auto object-contain rounded-2xl"
          draggable={false}
        />
      );
    })();

    return (
      <li
        key={key}
        className={cx(
          'flex-none select-none',
          isVertical ? 'mb-[var(--logoloop-gap)]' : 'mr-[var(--logoloop-gap)]',
          scaleOnHover && 'group/item'
        )}
      >
        <div
          className={cx(
            'transition-transform duration-300 ease-out',
            scaleOnHover && 'group-hover/item:scale-105'
          )}
        >
          {item.href ? (
            <a href={item.href} target="_blank" rel="noreferrer" aria-label={item.ariaLabel || item.title || item.alt || 'logo link'}>
              {itemContent}
            </a>
          ) : itemContent}
        </div>
      </li>
    );
  };

  const lists = Array.from({ length: copyCount }, (_, copyIndex) => (
    <ul
      key={`logo-copy-${copyIndex}`}
      ref={copyIndex === 0 ? seqRef : undefined}
      className={cx('flex items-center', isVertical && 'flex-col')}
      aria-hidden={copyIndex > 0}
    >
      {logos.map((item, itemIndex) => renderLogoItem(item, `${copyIndex}-${itemIndex}`))}
    </ul>
  ));

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={ariaLabel}
      className={cx('relative overflow-hidden group', isVertical ? 'h-full' : 'w-full', className)}
      style={{
        ...rootStyle,
        '--logoloop-gap': `${gap}px`,
        '--logoloop-logoHeight': `${logoHeight}px`,
        '--logoloop-fadeColorAuto': '#fff7ef',
        '--logoloop-fadeColor': fadeOutColor,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {fadeOut && (
        <>
          {isVertical ? (
            <>
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-[var(--logoloop-fadeColor,var(--logoloop-fadeColorAuto))] to-transparent" />
              <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-[var(--logoloop-fadeColor,var(--logoloop-fadeColorAuto))] to-transparent" />
            </>
          ) : (
            <>
              <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-[var(--logoloop-fadeColor,var(--logoloop-fadeColorAuto))] to-transparent" />
              <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-[var(--logoloop-fadeColor,var(--logoloop-fadeColorAuto))] to-transparent" />
            </>
          )}
        </>
      )}

      <div
        ref={trackRef}
        className={cx('flex will-change-transform select-none', isVertical ? 'flex-col w-full' : 'w-max items-center')}
      >
        {lists}
      </div>
    </div>
  );
});

LogoLoop.displayName = 'LogoLoop';

export default LogoLoop;
