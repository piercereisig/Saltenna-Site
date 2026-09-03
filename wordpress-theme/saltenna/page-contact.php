<?php
/**
 * Contact page.
 */
get_header();
?>

  <section class="page-hero">
    <div class="container">
      <span class="eyebrow">Contact</span>
      <h1>Get in touch.</h1>
      <p>To learn more about Saltenna's technology, discuss a use case, or explore working together, contact our team in McLean, Virginia.</p>
    </div>
  </section>

  <section class="block">
    <div class="container contact-grid">
      <div class="contact-info reveal">
        <h3>Headquarters</h3>
        <div class="info-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
          <div>
            <b>Saltenna Inc.</b>
            1751 Pinnacle Dr, Suite 600<br />McLean, VA 22102-4007<br />United States
          </div>
        </div>
        <div class="info-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
          <div>
            <b>Email</b>
            <a href="mailto:info@saltenna.com">info@saltenna.com</a>
          </div>
        </div>
        <div class="info-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h5"/></svg>
          <div>
            <b>Government Identifiers</b>
            CAGE: 7VPY9<br />DUNS: 08-0672349<br />UEI: MHBLZ1BWMNQ3
          </div>
        </div>
      </div>

      <form class="contact-form reveal" id="contact-form">
        <div class="form-row">
          <div>
            <label for="name">Name</label>
            <input id="name" name="name" type="text" required autocomplete="name" />
          </div>
          <div>
            <label for="org">Organization</label>
            <input id="org" name="org" type="text" autocomplete="organization" />
          </div>
        </div>
        <label for="email">Email</label>
        <input id="email" name="email" type="email" required autocomplete="email" />
        <label for="topic">I'm interested in</label>
        <select id="topic" name="topic">
          <option>Communications</option>
          <option>Sensing</option>
          <option>Partnership</option>
          <option>Careers</option>
          <option>Media / Press</option>
          <option>Other</option>
        </select>
        <label for="message">Message</label>
        <textarea id="message" name="message" required placeholder="How can we help?"></textarea>
        <button class="btn btn-primary" type="submit">Send Message</button>
        <p class="form-note">This opens your email client addressed to info@saltenna.com.</p>
      </form>
    </div>
  </section>

<?php get_footer(); ?>
