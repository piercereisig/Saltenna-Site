  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="logo" href="<?php echo esc_url( home_url( '/' ) ); ?>">
            <img src="<?php echo esc_url( saltenna_asset( 'images/logo-white.png' ) ); ?>" alt="Saltenna" />
          </a>
          <p>Wireless communications and sensing in the most difficult environments on Earth.</p>
        </div>
        <div>
          <h4>Technology</h4>
          <ul>
            <li><a href="<?php echo esc_url( saltenna_page_url( 'communications' ) ); ?>">Communications</a></li>
            <li><a href="<?php echo esc_url( saltenna_page_url( 'sensing' ) ); ?>">Sensing</a></li>
          </ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><a href="<?php echo esc_url( saltenna_page_url( 'about' ) ); ?>">About</a></li>
            <li><a href="<?php echo esc_url( saltenna_page_url( 'about' ) ); ?>#team">Leadership</a></li>
            <li><a href="<?php echo esc_url( saltenna_page_url( 'contact' ) ); ?>">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4>Headquarters</h4>
          <p>1751 Pinnacle Dr, Suite 600<br />McLean, VA 22102-4007<br />United States</p>
        </div>
      </div>
      <div class="footer-meta">
        <div class="codes">
          <span>CAGE: 7VPY9</span>
          <span>DUNS: 08-0672349</span>
          <span>UEI: MHBLZ1BWMNQ3</span>
        </div>
        <div>© <?php echo esc_html( gmdate( 'Y' ) ); ?> Saltenna Inc. All rights reserved.</div>
      </div>
    </div>
  </footer>

<?php wp_footer(); ?>
</body>
</html>
