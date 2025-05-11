import React, { useState, useEffect } from 'react';
import './Slider.css';

function Slider({ images, interval = 5000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Cambiar la imagen cada cierto tiempo
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length); // Cambio cíclico de imágenes
    }, interval);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, [images.length, interval]);

  // Funciones para cambiar la imagen manualmente
  const goToPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <div className="slider-container">
      <div className="slider-item">
        <img src={images[currentIndex]} alt={`Slide ${currentIndex}`} className="slider-image" />
      </div>
      
  
    </div>
  );
}

export default Slider;
