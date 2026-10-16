import React from 'react';

const Guide = () => {
    return (
        <div className="guide-container">
            <h2>Cómo rezar el Rosario</h2>

            <div className="steps-list">
                <div className="step-card card">
                    <div className="step-number">1</div>
                    <div className="step-content">
                        <h3>Señal de la Cruz</h3>
                        <p>Comienza haciendo la señal de la cruz.</p>
                    </div>
                </div>

                <div className="step-card card">
                    <div className="step-number">2</div>
                    <div className="step-content">
                        <h3>Credo y Acto de Contrición</h3>
                        <p>Reza el Credo de los Apóstoles y, opcionalmente, el Acto de Contrición.</p>
                    </div>
                </div>

                <div className="step-card card">
                    <div className="step-number">3</div>
                    <div className="step-content">
                        <h3>Los Misterios</h3>
                        <p>Anuncia el primer misterio. Reza un Padre Nuestro.</p>
                    </div>
                </div>

                <div className="step-card card">
                    <div className="step-number">4</div>
                    <div className="step-content">
                        <h3>Las 10 Ave Marías</h3>
                        <p>Reza 10 Ave Marías meditando el misterio.</p>
                    </div>
                </div>

                <div className="step-card card">
                    <div className="step-number">5</div>
                    <div className="step-content">
                        <h3>Gloria y Jaculatoria</h3>
                        <p>Termina la decena con un Gloria y la jaculatoria de Fátima.</p>
                    </div>
                </div>

                <div className="step-card card">
                    <div className="step-number">6</div>
                    <div className="step-content">
                        <h3>Finalizar</h3>
                        <p>Al terminar los 5 misterios, reza la Salve y las Letanías.</p>
                    </div>
                </div>
            </div>

            <style>{`
        .guide-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .step-card {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }
        .step-number {
          background-color: var(--color-primary);
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
        }
        .step-content h3 {
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
        }
        .step-content p {
          font-size: 0.95rem;
          color: var(--color-text-light);
        }
      `}</style>
        </div>
    );
};

export default Guide;
