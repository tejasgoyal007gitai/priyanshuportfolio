# Priyanshu Agarwal — Portfolio Website

A static, multi-page site: plain HTML, CSS and JavaScript, with no build step needed. Every file sits in this one folder (no subfolders), so it uploads correctly to GitHub or Vercel however you add it.

## Pages
| URL | Page |
|---|---|
| index.html | Home |
| about.html | About Me |
| education.html | Education |
| experience.html | Professional Experience |
| projects.html | Projects & Case Studies (+ 6 project detail pages) |
| achievements.html | Achievements & Leadership |
| skills.html | Skills & Expertise |
| certifications.html | Certifications |
| contact.html | Contact |

## Publish it (free)
- **Netlify:** go to app.netlify.com/drop and drag this whole folder onto the page.
- **Vercel / GitHub Pages:** upload the folder as a project; there's no build command and the output folder is the root.

## Things to update
1. **Photo:** `portrait.jpg` (hero crop) and `portrait-full.jpg` (About page). Replace them with the same file names to change the photo.
2. **Availability badge:** in `site.js`, change `availability: { on: true, text: "…" }`. Set `on: false` to hide it.
3. **Contact form:** by default it opens the visitor's email app with the message filled in. To receive messages directly, create a free form at formspree.io and paste its endpoint into `formEndpoint` in `site.js`. The form only reports "sent" after the service confirms it.
4. **Resume:** replace `Priyanshu_Agarwal_Resume.pdf` (and `resume-preview.jpg`) with the newest version, keeping the same file names.
5. **Project documents:** the Oizom pages link the CSAT survey (`csat-p-01.jpg` to `csat-p-11.jpg`) and the PPVVC workbook. The other projects say no documents are uploaded yet; add files to this folder and link them there.
6. **Search engines:** once the site has a web address, set `SITE_URL` in the generator, or add `<link rel="canonical">` tags.

## Content notes
All figures come from the resume, offer and experience letters, and certificates. The state chart and product counts on the B2G case study are totals computed from the State-wise opportunity workbook; the workbook itself is not published because it holds officials' names and contact details. The PPVVC scorer uses the questions, scoring and actions from the assessment workbook. A few items are not backed by an uploaded document: the QuizBlitz participant count (7,284), the "Strategic Partnerships: Ecosystems and Platforms" course, the Gulf and Africa recruitment markets, and football and badminton.
