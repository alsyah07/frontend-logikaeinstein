import React from 'react';

const About = () => {
  return (
    <div id="about" className="about-us section">
      <div className="container">
        <div className="row">
          <div className="col-lg-6">
            <div className="left-image wow fadeInLeft" data-wow-duration="1s" data-wow-delay="0.5s">
              <img src="assets/images/about-left-image.png" alt="" />
            </div>
          </div>
          <div className="col-lg-6 align-self-center wow fadeInRight" data-wow-duration="1s" data-wow-delay="0.5s">
            <div className="section-heading">
              <h6>About Us</h6>
              <h2>Kami Adalah <em>Platform Pembelajaran</em> &amp; <span>Edukasi Terdepan</span></h2>
            </div>
            <div className="row">
              <div className="col-lg-4 col-sm-4">
                <div className="about-item">
                  <h4>750+</h4>
                  <h6>projects finished</h6>
                </div>
              </div>
              <div className="col-lg-4 col-sm-4">
                <div className="about-item">
                  <h4>340+</h4>
                  <h6>happy clients</h6>
                </div>
              </div>
              <div className="col-lg-4 col-sm-4">
                <div className="about-item">
                  <h4>128+</h4>
                  <h6>awards</h6>
                </div>
              </div>
            </div>
            <p>
              <strong>Logika Einstein</strong> hadir sebagai solusi inovatif untuk pembelajaran fisika dan matematika. 
              Kami berkomitmen memberikan pengalaman belajar yang menyenangkan dan efektif untuk siswa di seluruh Indonesia. 
              Platform kami menggabungkan teknologi modern dengan metode pembelajaran yang terbukti efektif.
            </p>
            <div className="main-green-button">
              <a href="#">Jelajahi Kursus</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;