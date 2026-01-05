Box Designer Web App
====================

A simple web front-end to the box designer command line tool for making designs you can laser-cut.

https://dataculture.northeastern.edu/box-designer/

Dependencies
------------

Run `npm install` to install all the dev packages you need

Running
-------

Just run `npm run dev` and then try it at http://localhost:5001 in your web browser.

If you want to render a box in code, see the `test-render.py` example.

License
-------

This software is released under the [GNU Affero General Public License](http://www.gnu.org/licenses/agpl.html).

Deploying
---------

This is built to be deployed as a server-less static web-app, for hosting on Github Pages.

To deploy simply run `npm run build` and the runnable HTML output will be in the `docs` folder.

Contributors
------------

Box Designer started as a piece of Java desktop software in April of 2001 while Rahul Bhargava was a student at the
MIT Media Lab's Lifelong Kindergarten Group. Since then, as it evolved into a Rails web app, then a Python web app, and now an AI-assisted port to a Svelte static app for server-less hosting. Others have contributed important pieces:

* [@wildsparx](https://github.com/wildsparx) on GitHub contributed the DXF output
* [@vincentadam87](https://github.com/vincentadam87) on GitHub contributed the "no top" option
* eolson [at] mit [dot] edu contributed the original notch length and kerf options
* [@kentquirk](https://github.com/kentquirk) on GitHub contributed SVG output and made the system generate closed curves in PDF and SVG
