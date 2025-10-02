import React from 'react';

const Banner = () => {
  return (
    <div className="main-banner wow fadeIn" id="top" data-wow-duration="1s" data-wow-delay="0.5s">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="row">
              <div className="col-lg-6 align-self-center">
                <div className="left-content header-text wow fadeInLeft" data-wow-duration="1s" data-wow-delay="1s">
                  <div className="row">              
                    <div className="col-lg-12">
                      <h2>Inovasi <em>Untuk Masa Depan</em> Anak-anak <span>Indonesia</span></h2>
                      <h5>
                        Logika Einstein adalah platform pendidikan fisika dan matematika
                        yang didesain khusus untuk anak-anak.
                        
                        Platform ini menyediakan berbagai kursus interaktif, simulasi,
                        dan latihan soal yang dirancang untuk membantu anak-anak
                        memahami konsep-konsep fisika dan matematika dengan lebih mudah.
                      </h5>
                        <br></br>
                    </div>
                    <div className="col-lg-12">
                      <div className="main-green-button scroll-to-section">
                        <a href="#contact">Mulai Belajar Sekarang</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="right-image wow fadeInRight" data-wow-duration="1s" data-wow-delay="0.5s">
                  <img src="assets/images/banner-right-image.png" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;