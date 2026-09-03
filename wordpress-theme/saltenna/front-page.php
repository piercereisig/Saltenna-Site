<?php
/**
 * Front page — hero with wave animation and video, capability sections.
 */
get_header();
?>

  <!-- Hero -->
  <section class="hero">
    <video class="hero-video" autoplay muted loop playsinline aria-hidden="true">
      <source src="<?php echo esc_url( saltenna_asset( 'videos/saltenna-main.mp4' ) ); ?>" type="video/mp4" />
    </video>
    <canvas id="wave-canvas" aria-hidden="true"></canvas>
    <div class="container hero-content">
      <span class="eyebrow">Wireless Communications and Sensing</span>
      <h1>The solution for wireless <span class="grad">dead zones</span>.</h1>
      <p class="lede">Until now, wireless communications wasn't possible underwater, underground, in dense jungles, or through metals and other obstacles. Saltenna is a pioneer in Plasmonic communications — a ground-breaking technology that enables high-speed, high-bandwidth, and secure wireless communications and sensing in environments previously thought impossible.</p>
      <div class="btn-row">
        <a class="btn btn-primary" href="<?php echo esc_url( saltenna_page_url( 'communications' ) ); ?>">Explore the Technology</a>
        <a class="btn btn-ghost" href="<?php echo esc_url( saltenna_page_url( 'contact' ) ); ?>">Talk to Our Team</a>
      </div>
      <div class="hero-stats">
        <div class="stat"><b>Dual-Use</b><span>Government &amp; Commercial</span></div>
        <div class="stat"><b>Patented</b><span>Multiple Patents Granted</span></div>
        <div class="stat"><b>DoW</b><span>Contracts &amp; Demonstrations</span></div>
      </div>
    </div>
  </section>

  <!-- Environment strip -->
  <div class="env-strip" aria-hidden="true">
    <div class="env-track">
      <span>Underwater</span><span>Through Ice</span><span>Through Metal</span><span>Underground</span><span>Dense Vegetation</span><span>Seabeds</span><span>Collapsed Infrastructure</span><span>Lunar Surface</span>
      <span>Underwater</span><span>Through Ice</span><span>Through Metal</span><span>Underground</span><span>Dense Vegetation</span><span>Seabeds</span><span>Collapsed Infrastructure</span><span>Lunar Surface</span>
    </div>
  </div>

  <!-- Problem / solution -->
  <section class="block">
    <div class="container">
      <div class="section-head reveal">
        <span class="eyebrow">Wireless Dead Zones</span>
        <h2>Environments previously thought impossible.</h2>
        <p>Water, ice, land, metal, seabeds and riverbeds, soil layers, and even solid rock. Where current radios, Wi‑Fi, Bluetooth, optical, audio, and other systems fail, Saltenna's Plasmonic waves keep working.</p>
      </div>
      <div class="card-grid">
        <div class="card reveal">
          <div class="icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><path d="M2 12 Q5 8 8 12 T14 12 T20 12"/><path d="M2 17 Q5 13 8 17 T14 17 T20 17"/><path d="M12 3v4"/><circle cx="12" cy="3" r="1"/></svg></div>
          <h3>Water &amp; Ice</h3>
          <p>Saltenna is developing high-bandwidth stealthy communications underwater without needing line of sight, and through and along ice sheets to connect above-ice assets with those submerged beneath.</p>
        </div>
        <div class="card reveal">
          <div class="icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 12h6M12 9v6"/></svg></div>
          <h3>Metal &amp; Solid Obstacles</h3>
          <p>Rather than being blocked by metal, Saltenna's Plasmonics leverage it. Saltenna has demonstrated communications and sensing along and through pressurized tanks and pipes without drilling holes or running wires.</p>
        </div>
        <div class="card reveal">
          <div class="icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><path d="M3 20h18"/><path d="M6 20V10l6-6 6 6v10"/><path d="M10 20v-5h4v5"/></svg></div>
          <h3>Soil, Rock &amp; Infrastructure</h3>
          <p>Saltenna has demonstrated significantly enhanced range over current wireless technology in solid underground facilities, tunnels, and through multiple levels of parking garages.</p>
        </div>
        <div class="card reveal">
          <div class="icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><path d="M12 2v20"/><path d="M5 9c2-3 5-4 7-4s5 1 7 4"/><path d="M6 15c2-2 4-3 6-3s4 1 6 3"/></svg></div>
          <h3>Dense Vegetation</h3>
          <p>Where radios may fail, Saltenna is working on Plasmonics that can carry communications within and through dense jungle canopy to support commercial, military, law enforcement, and intelligence operations.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Two business areas -->
  <section class="block alt">
    <div class="container">
      <div class="section-head reveal">
        <span class="eyebrow">What We Do</span>
        <h2>Communications and sensing.</h2>
      </div>

      <div class="split reveal">
        <div>
          <span class="eyebrow">Communications</span>
          <h3>Game-changing communications at the edge.</h3>
          <p>Saltenna's Plasmonics enable a vast array of use cases in communications, because the ability of Plasmonic waves to travel along surfaces enables game-changing communications at the edge across an array of sectors and industries, both government and commercial.</p>
          <ul>
            <li><b>Underwater &amp; under ice</b> — connecting submerged assets without line of sight</li>
            <li><b>Through metal</b> — inside ships, around aircraft, and in pressurized systems</li>
            <li><b>Industrial IoT</b> — along and through pressurized tanks, pipes, and pipelines</li>
          </ul>
          <p><a href="<?php echo esc_url( saltenna_page_url( 'communications' ) ); ?>">Explore Communications →</a></p>
        </div>
        <div class="split-media" data-parallax="0.22">
          <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of plasmonic waves traveling along a surface underwater">
            <defs>
              <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#0d1424"/><stop offset="1" stop-color="#07263a"/>
              </linearGradient>
            </defs>
            <rect width="400" height="300" fill="url(#sea)"/>
            <path d="M0 90 Q50 80 100 90 T200 90 T300 90 T400 90" stroke="#4aa8ff" stroke-width="1.5" fill="none" opacity="0.5"/>
            <path d="M0 150 Q40 138 80 150 T160 150 T240 150 T320 150 T400 150" stroke="#35d0c5" stroke-width="2" fill="none"/>
            <path d="M0 165 Q40 155 80 165 T160 165 T240 165 T320 165 T400 165" stroke="#35d0c5" stroke-width="1.2" fill="none" opacity="0.5"/>
            <circle cx="80" cy="150" r="5" fill="#35d0c5"/>
            <circle cx="320" cy="150" r="5" fill="#35d0c5"/>
            <path d="M80 150 v-40 M320 150 v-40" stroke="#35d0c5" stroke-width="1.5" opacity="0.7"/>
            <circle cx="80" cy="103" r="7" stroke="#35d0c5" stroke-width="1.5" fill="none"/>
            <circle cx="320" cy="103" r="7" stroke="#35d0c5" stroke-width="1.5" fill="none"/>
            <path d="M60 240 Q120 225 200 240 T400 235 L400 300 L0 300 Z" fill="#0a1a2c"/>
            <text x="200" y="285" text-anchor="middle" fill="#5b7290" font-family="monospace" font-size="11" letter-spacing="3">SURFACE-WAVE LINK</text>
          </svg>
        </div>
      </div>

      <div class="split reverse reveal">
        <div>
          <span class="eyebrow">Sensing</span>
          <h3>Sensing subtle changes in any environment.</h3>
          <p>Plasmonics are sensitive to subtle changes in their environment and can be used for an array of sensing applications, from detecting the movement of submarines underwater to detecting the movement of people through solid sheet metal.</p>
          <ul>
            <li><b>Security</b> — adversary detection in denied environments</li>
            <li><b>Industry</b> — sensor reporting through solid metal, including pressurized tanks</li>
            <li><b>Research &amp; health</b> — environmental monitoring and bioimaging</li>
          </ul>
          <p><a href="<?php echo esc_url( saltenna_page_url( 'sensing' ) ); ?>">Explore Sensing →</a></p>
        </div>
        <div class="split-media" data-parallax="0.22">
          <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of sensing through a metal barrier">
            <defs>
              <radialGradient id="pulse" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stop-color="#35d0c5" stop-opacity="0.5"/><stop offset="1" stop-color="#35d0c5" stop-opacity="0"/>
              </radialGradient>
            </defs>
            <rect width="400" height="300" fill="#0d1424"/>
            <rect x="185" y="30" width="30" height="240" fill="#1b2740" stroke="#2c3d5e"/>
            <text x="200" y="20" text-anchor="middle" fill="#5b7290" font-family="monospace" font-size="10" letter-spacing="2">SOLID METAL</text>
            <circle cx="90" cy="150" r="70" fill="url(#pulse)"/>
            <circle cx="90" cy="150" r="10" fill="none" stroke="#35d0c5" stroke-width="2"/>
            <circle cx="90" cy="150" r="26" fill="none" stroke="#35d0c5" stroke-width="1" opacity="0.6"/>
            <circle cx="90" cy="150" r="44" fill="none" stroke="#35d0c5" stroke-width="1" opacity="0.35"/>
            <path d="M215 150 H280" stroke="#4aa8ff" stroke-width="1.5" stroke-dasharray="4 4"/>
            <circle cx="305" cy="150" r="22" fill="none" stroke="#4aa8ff" stroke-width="1.5"/>
            <path d="M305 141a9 9 0 1 1-.1 0M295 168c2-7 18-7 20 0" stroke="#4aa8ff" stroke-width="1.5" fill="none"/>
            <text x="305" y="195" text-anchor="middle" fill="#5b7290" font-family="monospace" font-size="10" letter-spacing="2">DETECTED</text>
          </svg>
        </div>
      </div>
    </div>
  </section>

  <!-- Trust / credentials -->
  <section class="block">
    <div class="container">
      <div class="section-head center reveal">
        <span class="eyebrow">About Saltenna</span>
        <h2>A dual-use company in the Washington DC metro area.</h2>
        <p>Saltenna is leveraging its revolutionary technology to develop highly innovative solutions for a wide array of government and commercial customers.</p>
      </div>
      <div class="card-grid">
        <div class="card reveal">
          <div class="icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/></svg></div>
          <h3>U.S. Department of War</h3>
          <p>Saltenna has performed on multiple contracts and demonstrated its technology for the U.S. Department of War and commercial customers.</p>
        </div>
        <div class="card reveal">
          <div class="icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="5"/><path d="M9 13l-2 8 5-3 5 3-2-8"/></svg></div>
          <h3>Patented Technology</h3>
          <p>Saltenna has multiple patents on its technology and is heavily engaged in further R&amp;D.</p>
        </div>
        <div class="card reveal">
          <div class="icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><path d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14"/><path d="M2 19h20"/><path d="M9 8h6M9 12h6"/></svg></div>
          <h3>World-Class Team</h3>
          <p>Led by a founding CTO with 400+ published papers and executives with decades of experience across defense, semiconductors, wireless, and subsea systems.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- LinkedIn newsroom -->
  <section class="block alt" id="news">
    <div class="container">
      <div class="section-head reveal">
        <span class="eyebrow">Newsroom</span>
        <h2>The latest from Saltenna.</h2>
        <p>Company news and updates, live from our LinkedIn page.</p>
      </div>
      <?php
      // Set the widget embed URL under Appearance → Customize → LinkedIn Feed.
      $saltenna_li_embed = get_theme_mod( 'saltenna_linkedin_embed', 'https://widgets.sociablekit.com/linkedin-page-posts/iframe/25695728' );
      ?>
      <div class="linkedin-feed reveal" id="linkedin-feed" data-embed="<?php echo esc_url( $saltenna_li_embed ); ?>" data-posts="<?php echo esc_url( saltenna_asset( 'data/posts.json' ) ); ?>">
        <div class="linkedin-fallback">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="1"/><path d="M7 10v7"/><circle cx="7" cy="7" r="0.5"/><path d="M11 17v-4a2.5 2.5 0 0 1 5 0v4M11 10v1"/></svg>
          <h3>Follow Saltenna on LinkedIn</h3>
          <p>Once the company LinkedIn page is connected, our latest posts will appear here automatically.</p>
          <a class="btn btn-ghost" href="<?php echo esc_url( get_theme_mod( 'saltenna_linkedin_url', 'https://www.linkedin.com/company/saltenna/' ) ); ?>" target="_blank" rel="noopener">Visit Our LinkedIn</a>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-band">
    <div class="container reveal">
      <h2>Saltenna is evolving fast.</h2>
      <p>To learn more about our technology, discuss a use case, or explore working together, get in touch with our team.</p>
      <a class="btn btn-primary" href="<?php echo esc_url( saltenna_page_url( 'contact' ) ); ?>">Contact Saltenna</a>
    </div>
  </section>

<?php get_footer(); ?>
