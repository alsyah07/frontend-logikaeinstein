import React from 'react';

const Contact = () => {
  return (
    <div id="contact" className="contact-us section">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 wow fadeInUp" data-wow-duration="0.5s" data-wow-delay="0.25s">
            <form id="contact" action="" method="post">
              <div className="row">
                <div className="col-lg-6 offset-lg-3">
                  <div className="section-heading">
                    <h6>Hubungi Kami</h6>
                    <h2>Bergabung Dengan <em>Platform Kami</em>, <span>Sekarang Juga</span></h2>
                  </div>
                </div>
                <div className="col-lg-9">
                  <div className="row">
                    <div className="col-lg-6">
                      <fieldset>
                        <input type="name" name="name" id="name" placeholder="Nama Lengkap..." autoComplete="on" required />
                      </fieldset>
                    </div>
                    <div className="col-lg-6">
                      <fieldset>
                        <input type="surname" name="surname" id="surname" placeholder="Surname" autoComplete="on" required />
                      </fieldset>
                    </div>
                    <div className="col-lg-6">
                      <fieldset>
                        <input type="text" name="email" id="email" pattern="[^ @]*@[^ @]*" placeholder="Email Anda..." required />
                      </fieldset>
                    </div>
                    <div className="col-lg-6">
                      <fieldset>
                        <input type="subject" name="subject" id="subject" placeholder="Kelas/Tingkat Pendidikan..." autoComplete="on" />
                      </fieldset>
                    </div>
                    <div className="col-lg-12">
                      <fieldset>
                        <textarea name="message" type="text" className="form-control" id="message" placeholder="Pesan atau Pertanyaan Anda..." required></textarea>
                      </fieldset>
                    </div>
                    <div className="col-lg-12">
                      <fieldset>
                        <button type="submit" id="form-submit" className="main-button">
                          Daftar Sekarang
                        </button>
                      </fieldset>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3">
                  <div className="contact-info">
                    <ul>
                      <li>
                        <div className="icon">
                          <img src="assets/images/contact-icon-01.png" alt="email icon" />
                        </div>
                        <a href="#">info@logikaeinstein.com</a>
                      </li>
                      <li>
                        <div className="icon">
                          <img src="assets/images/contact-icon-02.png" alt="phone" />
                        </div>
                        <a href="#">+62-21-1234-5678</a>
                      </li>
                      <li>
                        <div className="icon">
                          <img src="assets/images/contact-icon-03.png" alt="location" />
                        </div>
                        <a href="#">Jakarta, Indonesia</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;