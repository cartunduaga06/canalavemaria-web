import React from 'react';
import { Link } from 'react-router-dom';
import { Play, BookOpen, HelpCircle } from 'lucide-react';

const Home = () => {
    return (
        <div className="home-container">
            <section className="hero">
                <h1>Reza el Rosario con Ave María</h1>
                <p className="subtitle">Un espacio de paz y oración en tu día a día.</p>

                <div className="cta-group">
                    <Link to="/rezar" className="btn btn-primary w-full">
                        <Play size={20} fill="currentColor" />
                        Rezar Rosario ahora
                    </Link>

                    <Link to="/guia" className="btn btn-secondary w-full">
                        <HelpCircle size={20} />
                        Cómo se reza
                    </Link>

                    <Link to="/oraciones" className="btn btn-secondary w-full">
                        <BookOpen size={20} />
                        Oraciones básicas
                    </Link>
                </div>
            </section>

            <section className="about card mt-4">
                <h3>¿Quiénes somos?</h3>
                <p>
                    Ave María Rosario es una herramienta digital para ayudarte a meditar los misterios de la vida de Jesús de la mano de María.
                    Diseñada para acompañarte en tu oración diaria, donde quiera que estés.
                </p>
            </section>

            <style>{`
        .home-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding-top: 2rem;
        }
        .hero {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          align-items: center;
        }
        .hero h1 {
          font-size: 2rem;
          line-height: 1.2;
        }
        .subtitle {
          color: var(--color-text-light);
          font-size: 1.1rem;
        }
        .cta-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
          max-width: 300px;
        }
        .about p {
          color: var(--color-text-light);
          font-size: 0.95rem;
        }
      `}</style>
        </div>
    );
};

export default Home;
