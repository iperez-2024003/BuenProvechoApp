import React from 'react';
import styled from 'styled-components';
import { Clock, User } from 'lucide-react';

export const MenuFlipCard = ({ title, category, price, time, servings, image }) => {
  return (
    <StyledWrapper>
      <div className="card group">
        <div className="shadow-block" />
        <div className="content group-hover:-translate-y-1 transition-transform duration-300">
          <div className="back">
            <div className="back-content">
              <div className="w-16 h-16 bg-[#b98c52] rounded flex items-center justify-center border-2 border-[#1c1712] shadow-[3px_3px_0px_#1c1712]">
                 <span className="text-3xl font-black text-[#fffaf3]">$</span>
              </div>
              <div className="text-center">
                <p className="text-[#1c1712] font-black text-4xl uppercase">{price}</p>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">Precio sugerido</p>
              </div>
              <button className="px-6 py-3 bg-[#fffaf3] text-[#1c1712] border-2 border-[#1c1712] font-black rounded text-[10px] uppercase tracking-[0.2em] hover:bg-[#b98c52] hover:text-[#fffaf3] transition-colors shadow-[3px_3px_0px_#1c1712] active:translate-y-1 active:shadow-none">
                Ver Detalles
              </button>
            </div>
          </div>
          <div className="front">
            <div className="img-container">
              <img src={image} alt={title} className="main-img" />
              <div className="overlay" />
            </div>
            <div className="front-content">
              <small className="badge">{category}</small>
              <div className="description">
                <div className="title-row">
                  <p className="title-text">
                    <strong>{title}</strong>
                  </p>
                  <svg fillRule="nonzero" height="15px" width="15px" viewBox="0,0,256,256" xmlns="http://www.w3.org/2000/svg"><g style={{mixBlendMode: 'normal'}} fillRule="nonzero" fill="#1c1712"><g transform="scale(8,8)"><path d="M25,27l-9,-6.75l-9,6.75v-23h18z" /></g></g></svg>
                </div>
                <div className="card-footer">
                   <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{time}</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>{servings}</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    position: relative;
    width: 260px;
    height: 340px;
    perspective: 1000px;
    cursor: pointer;
  }

  .shadow-block {
    position: absolute;
    top: 8px;
    left: 8px;
    width: 100%;
    height: 100%;
    background-color: #1c1712;
    border-radius: 0.5rem;
    z-index: 0;
  }

  .content {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 600ms cubic-bezier(0.23, 1, 0.32, 1);
    border-radius: 0.5rem;
    z-index: 1;
  }

  .front, .back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 0.5rem;
    overflow: hidden;
    border: 2px solid #1c1712;
    background-color: #fffaf3;
  }

  .back {
    display: flex;
    justify-content: center;
    align-items: center;
    transform: rotateY(180deg);
  }

  .back-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    padding: 20px;
  }

  .card:hover .content {
    transform: rotateY(180deg) translateY(-4px);
  }

  .img-container {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .main-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(28, 23, 18, 0.8), transparent 60%);
  }

  .front-content {
    position: absolute;
    width: 100%;
    height: 100%;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    z-index: 5;
  }

  .badge {
    background-color: #b98c52;
    padding: 6px 14px;
    border-radius: 4px;
    width: fit-content;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #fffaf3;
    border: 2px solid #1c1712;
    box-shadow: 2px 2px 0px #1c1712;
  }

  .description {
    width: 100%;
    padding: 16px;
    background-color: #fffaf3;
    border-radius: 0.5rem;
    border: 2px solid #1c1712;
    box-shadow: 4px 4px 0px #1c1712;
  }

  .title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .title-text {
    font-size: 16px;
    font-weight: 900;
    color: #1c1712;
    text-transform: uppercase;
    letter-spacing: -0.02em;
  }

  .card-footer {
    display: flex;
    gap: 16px;
    color: #4a4036;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;
