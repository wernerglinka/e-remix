# Local Fonts in Electron

Since Electron uses the Google Chrome engine, it's compatible with the WOFF2 font format. While Google Fonts provides TTF files, these are not optimal for your needs.

To obtain the desired WOFF2 format, we can use the [Google Webfonts Helper](https://gwfh.mranftl.com/fonts) tool. This website offers a variety of font formats, including the WOFF and WOFF2 formats which are suitable for web usage and Electron applications.

**Font Selection and Customization:**

- **Search for Fonts:** On the Google Webfonts Helper site, you can search for the specific fonts you need.
- **Choose Font Weights and Styles:** You can select different weights (like regular, bold) and styles (like italic) based on your requirements.

**Obtaining CSS Snippet:**

- After selecting the fonts and their variations, the tool generates a CSS snippet.
- This snippet includes the `@font-face` rules, specifying how the font should be displayed.
- You need to integrate this CSS snippet into your `fonts.css` file. This step ensures that the fonts are correctly referenced and displayed in your Electron application.

**Getting the Font Files:**

- The selected fonts can be downloaded as a Zip package from the Google Webfonts Helper site.
- After downloading, you'll need to unzip the files.
- Once unzipped, these font files should be placed in the `public/fonts/` folder of your Electron project. This placement is critical for the CSS rules to correctly locate and apply the fonts.
