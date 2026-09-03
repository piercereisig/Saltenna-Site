<?php
/**
 * About page — company overview and leadership team.
 */
get_header();
?>

  <section class="page-hero">
    <div class="container">
      <span class="eyebrow">About Saltenna</span>
      <h1>A pioneer in Plasmonics.</h1>
      <p>Saltenna is a pioneer in Plasmonics, a new wireless communications and sensing technology that behaves differently from all others. We are developing high-speed, high-bandwidth, and secure wireless communications in difficult edge environments where current radios, Wi‑Fi, Bluetooth, optical, audio, and other systems fail.</p>
    </div>
  </section>

  <section class="block">
    <div class="container">
      <div class="split reveal">
        <div>
          <span class="eyebrow">Who We Are</span>
          <h3>A dual-use company in the Washington DC metro area.</h3>
          <p>Saltenna is strategically located in the Washington DC metro area and is leveraging its revolutionary technology to develop highly innovative solutions for a wide array of government and commercial customers.</p>
          <ul>
            <li><b>Patented</b> — multiple patents on our technology, with further R&amp;D heavily underway</li>
            <li><b>Proven</b> — multiple contracts and demonstrations for the U.S. Department of War and commercial customers</li>
            <li><b>Dual-use</b> — serving a wide array of government and commercial customers</li>
          </ul>
        </div>
        <div class="split-media" data-parallax="0.22">
          <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Stylized map marker over the Washington DC region">
            <rect width="400" height="300" fill="#0d1424"/>
            <path d="M0 210 Q60 190 120 205 T240 200 T400 210 L400 300 L0 300 Z" fill="#101a30"/>
            <path d="M0 240 Q80 225 160 238 T320 235 T400 240 L400 300 L0 300 Z" fill="#0b1220"/>
            <circle cx="200" cy="130" r="46" fill="none" stroke="#35d0c5" stroke-width="1" opacity="0.3"/>
            <circle cx="200" cy="130" r="30" fill="none" stroke="#35d0c5" stroke-width="1" opacity="0.5"/>
            <path d="M200 92c-18 0-30 13-30 29 0 21 30 49 30 49s30-28 30-49c0-16-12-29-30-29z" fill="none" stroke="#35d0c5" stroke-width="2"/>
            <circle cx="200" cy="122" r="8" fill="#35d0c5"/>
            <text x="200" y="230" text-anchor="middle" fill="#9fb0c7" font-family="monospace" font-size="11" letter-spacing="3">McLEAN, VIRGINIA</text>
            <text x="200" y="250" text-anchor="middle" fill="#5b7290" font-family="monospace" font-size="9" letter-spacing="2">WASHINGTON DC METRO</text>
          </svg>
        </div>
      </div>
    </div>
  </section>

  <section class="block alt" id="team">
    <div class="container">
      <div class="section-head reveal">
        <span class="eyebrow">Leadership</span>
        <h2>Management team.</h2>
        <p>Executives and scientists with decades of experience across defense, government, semiconductors, wireless, and subsea systems.</p>
      </div>
      <div class="team-grid">
        <div class="team-card reveal">
          <img class="avatar" src="<?php echo esc_url( saltenna_asset( 'images/dendy-young.jpg' ) ); ?>" alt="M. Dendy Young" />
          <h3>M. Dendy Young</h3>
          <div class="role">Executive Chairman</div>
          <p>Over 50 years of executive leadership in defense, government, and commercial technology. Managing Partner of McLean Capital and founding partner of Blu Venture Investors. B.S. Electrical Engineering and Computer Science, MIT; M.B.A., Harvard Business School.</p>
        </div>
        <div class="team-card reveal">
          <img class="avatar" src="<?php echo esc_url( saltenna_asset( 'images/igor-smolyaninov.jpg' ) ); ?>" alt="Dr. Igor Smolyaninov" />
          <h3>Dr. Igor Smolyaninov</h3>
          <div class="role">CTO &amp; Founder</div>
          <p>Globally recognized physicist with expertise in plasmonics, surface optics, and electromagnetic metamaterials. Author of 400+ papers, OSA Fellow, and Scientific American 50 Award recipient. Formerly of the University of Maryland, Gradient Dynamics, and BAE Systems. Ph.D. Physics, Kapitza Institute.</p>
        </div>
        <div class="team-card reveal">
          <img class="avatar" src="<?php echo esc_url( saltenna_asset( 'images/ashley-johnston.jpg' ) ); ?>" alt="Robert Ashley Johnston" />
          <h3>Robert "Ashley" Johnston</h3>
          <div class="role">Chief Operating Officer</div>
          <p>Technology executive with over 30 years leading growth and innovation across the semiconductor, wireless, and AI software industries. CEO of VanGogh Imaging and President of Setcom Wireless Products, with earlier leadership roles at Texas Instruments and Motorola Semiconductor. B.Eng, University of Limerick.</p>
        </div>
        <div class="team-card reveal">
          <img class="avatar" src="<?php echo esc_url( saltenna_asset( 'images/denny-brisley.jpg' ) ); ?>" alt="Captain Denny Brisley" />
          <h3>Capt. Denny Brisley, USN (Ret.)</h3>
          <div class="role">Chief Strategy Officer</div>
          <p>Aerospace executive with 30+ years advancing dual-use technology for national security and commercial markets. Senior executive roles at General Dynamics, SAIC, CAE, and NorthStar Earth &amp; Space; retired USN Captain (Intelligence). B.A., Stanford; M.A., U.S. Naval War College.</p>
        </div>
        <div class="team-card reveal">
          <img class="avatar" src="<?php echo esc_url( saltenna_asset( 'images/john-mulholland.jpg' ) ); ?>" alt="John Mulholland" />
          <h3>John Mulholland</h3>
          <div class="role">Division President, Energy Systems</div>
          <p>Strategic technology leader with over 25 years developing advanced controls infrastructure and sensor systems in military and subsea oil &amp; gas markets. Numerous patents in wireless subsea sensing and communications; Senior Member of the IEEE. M.Eng, University of Edinburgh.</p>
        </div>
        <div class="team-card reveal">
          <img class="avatar" src="<?php echo esc_url( saltenna_asset( 'images/sanjee-singla.jpg' ) ); ?>" alt="Sanjee Singla" />
          <h3>Sanjee Singla</h3>
          <div class="role">Division President, AI &amp; Robotics</div>
          <p>20+ years of innovation in hardware and software engineering; founder of Import Zen, Apply.co, and AT Strategic. Leads Saltenna's strategy, products, and contracts for AI and robotic platforms across all domains. B.A. and M.S., Stanford University.</p>
        </div>
        <div class="team-card reveal">
          <img class="avatar" src="<?php echo esc_url( saltenna_asset( 'images/quirino-balzano.png' ) ); ?>" alt="Dr. Quirino Balzano" />
          <h3>Dr. Quirino Balzano</h3>
          <div class="role">Senior Scientist</div>
          <p>Pioneer in RF dosimetry and antenna technology with 50+ papers and 31 patents. Former VP of Technical Staff at Motorola and researcher at Raytheon Missile Systems; now Senior Staff Researcher at the University of Maryland. Ph.D. Electronics Engineering, University of Rome, La Sapienza.</p>
        </div>
        <div class="team-card reveal">
          <img class="avatar" src="<?php echo esc_url( saltenna_asset( 'images/patrick-higby.jpeg' ) ); ?>" alt="Maj. Gen. Patrick Higby" />
          <h3>Maj. Gen. Patrick Higby, USAF (Ret.)</h3>
          <div class="role">Advisor</div>
          <p>Principal at Deep Water Point. U.S. Air Force: Director for DevOps &amp; Lethality, Director for Cyberspace Strategy, and Commander of the 81st Training Wing and 75th Air Base Wing. B.S. Electrical Engineering, Georgia Tech.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="cta-band">
    <div class="container reveal">
      <h2>Saltenna is evolving fast.</h2>
      <p>We're always interested in hearing from scientists, engineers, and potential partners.</p>
      <a class="btn btn-primary" href="<?php echo esc_url( saltenna_page_url( 'contact' ) ); ?>">Get in Touch</a>
    </div>
  </section>

<?php get_footer(); ?>
