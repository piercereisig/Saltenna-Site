# Saltenna WordPress Theme

A custom WordPress theme for Saltenna — plasmonic wireless communications and
sensing. Dark defense-tech design with an animated wave hero, self-hosted
background videos, scroll-reveal animations, and scroll-linked parallax.

## Installation

1. Zip the theme folder:
   ```
   cd wordpress-theme
   zip -r saltenna.zip saltenna
   ```
2. In WordPress admin, go to **Appearance → Themes → Add New Theme → Upload Theme**
   and upload `saltenna.zip`. (Or copy the `saltenna/` folder into
   `wp-content/themes/` over SFTP.)
3. Click **Activate**.

On activation the theme automatically:
- Creates the pages **Home, About, Communications, Sensing, Contact** (if they
  don't already exist)
- Sets **Home** as the static front page

That's it — the site is fully assembled. If your permalinks are set to "Plain,"
everything still works; for clean URLs like `/communications/`, set
**Settings → Permalinks → Post name**.

## Structure

| File | Purpose |
|---|---|
| `front-page.php` | Homepage (hero video + wave animation, capability sections) |
| `page-about.php` | About page with leadership team |
| `page-communications.php` | Communications use cases |
| `page-sensing.php` | Sensing use cases |
| `page-contact.php` | Contact info + mailto form |
| `header.php` / `footer.php` | Shared nav and footer |
| `index.php` | Fallback for posts/other pages |
| `functions.php` | Asset loading, helpers, page auto-creation |
| `assets/` | CSS, JS, images (logo + team photos), videos |

## Editing content

Page copy lives directly in the template files (matching the original static
site). To change text, edit the corresponding `page-*.php` file. Team members
are the `team-card` blocks in `page-about.php`; photos live in
`assets/images/`.

## Contact form

The form opens the visitor's mail client addressed to `info@saltenna.com`
(no plugin required). For server-side submissions, install **WPForms** or
**Contact Form 7** and replace the `<form id="contact-form">` block in
`page-contact.php` with the plugin's shortcode via `do_shortcode()`.

## Notes

- Videos autoplay muted and are ~23 MB total; they're served from the theme's
  `assets/videos/` folder. Consider a CDN or caching plugin for production.
- The parallax and wave animations automatically disable for visitors with
  "reduce motion" enabled in their OS.
