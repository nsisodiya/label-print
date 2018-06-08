#!/usr/bin/env node
'use strict';
console.log("Label Priting Software is by Narendra Sisodiya");
//https://electronjs.org/docs/tutorial/first-app
const {promisify} = require('util');

const fs = require('fs');
const readFileAsync = promisify(fs.readFile); // (A)
const writeFileAsync = promisify(fs.writeFile); // (B)

//const filePath = process.argv[2];
var gridConfig = {
  topMargin: 7.0,
  sideMargin: 15.5,
  verticalPitch: 66.0,
  horizontalPitch: 38.0,
  height: 63.5,
  width: 38.0,
  numColumns: 7,
  numRows: 3,
  paperWidth: 297,
  paperHeight: 210
};
const filePath = "./temp/input.csv";
var htmlStrFront = `<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <title></title>
    <link rel="stylesheet" href="./../normalize.css">
    <link rel="stylesheet" href="./../box-sizing.css">
    <link rel="stylesheet" href="./../index.css">
    <script src="./../JsBarcode.code128.min.js" charset="utf-8"></script>
  </head>
  <body>`;

function generatePage(gridConfig, items) {
  var {topMargin, sideMargin, verticalPitch, horizontalPitch,
    height, width, numColumns, numRows, paperWidth, paperHeight} = gridConfig;
    //${objectToHTML(items)}
    var totalPages = Math.ceil(items.length/(numColumns*numRows));
    console.log("Total Pages", totalPages);
    var allPages = "";
    for (var p = 0; p < totalPages; p++) {
      console.log(`Page, ${p}`);
      allPages = allPages + `<a4page style="
      display: inline-block;
      width: ${paperWidth}mm;
      height: ${paperHeight}mm;
      padding-left:${sideMargin}mm;
      padding-right:${sideMargin}mm;
      padding-bottom:${topMargin}mm;
      padding-top:${topMargin}mm;
      " class="page">
        ${(()=>{
          var str = "";
          for (var i = 0; i <  numRows; i++) {
            str = str + `<row style="
              //border: 0.5px solid blue;
              display: inline-block;
            ">`;
            for (var j = 0; j <  numColumns; j++) {
              var numItem = p*numColumns*numRows + i*numColumns + j;
              var itemData = items[numItem];
              console.log(i, j, numItem, itemData, JSON.stringify(itemData));
              var MB = "";
              if(i !== numRows - 1){
                MB = `margin-bottom:${verticalPitch - height}mm;`;
              }
              var MR = "";
              if(j !== numColumns - 1){
                MR = `margin-right:${horizontalPitch - width}mm;`;
              }
              var BC = "";
              if(itemData !== undefined){
                BC = `
                <div class="centerme"><canvas class="barcode"
                    jsbarcode-format="code128"
                    jsbarcode-value="${itemData.SKU}"
                    jsbarcode-textmargin="0"
                    jsbarcode-lineColor="#000"
                    jsbarcode-width="1.5"
                    jsbarcode-height="30"
                    jsbarcode-displayValue=false
                    jsbarcode-fontoptions="bold">
                  </canvas>
                  <text>SKU - ${itemData.SKU}</text>
                  </div>
                <itemtitle>${itemData.Title}</itemtitle>
                <colortext>Color : ${itemData.Color}</colortext>
                <sizetext>Size&nbsp;&nbsp; : ${(()=>{
                  if(itemData.Size2 === ""){
                    return `${itemData.Size}`;
                  } else {
                    return `${itemData.Size} - ${itemData.Size2}`;
                  }

                })()}</sizetext>
                <pricesection><money>₹ ${itemData.MRP}</money>&nbsp;&nbsp;&nbsp;<mrp>(MRP)</mrp></pricesection>
                <span class="AveFont">
                <text>Imported and Marketed by:</text>
                <text class="address">We18 Trends, G-402, Asawari, Nanded, Pune, (411041), India</text>
                <text>CustomerCare : +91-91790-98325</text>
                <text>Email : we18.trends@gmail.com</text>
                <text>Web   : www.we18.in</text></span>`;
              }
              str = str + `<box style="
                padding: 2mm;
                overflow: hidden;
                height: ${height}mm;
                width: ${width}mm;
                ${MR}
                ${MB}
                border-radius: 3mm;
                border: 1px solid pink;
                display: inline-block;
              ">
                  ${BC}
              </box>`;
            }
            str = str + `</row>`;
          }
          return str;
        })()}
      </a4page>`;
    }
    return allPages;
}
var htmlStrBack = `</body>
<script src="./../afterLoad.js" charset="utf-8"></script>
</html>`;

function fixLines(lines) {
  return lines.map(function (v, i) {
    return v.replace(/[\r]/g, '');
  })
}
async function main() {
    try {
        const text = await readFileAsync(filePath, {encoding: 'utf8'});
        var items = [];
        var lines = text.split("\n");
        lines = fixLines(lines);
        var headers = lines[0].split(",");
        lines.map(function (v, i) {
          if(v !== "" && i !== 0){
            var temp = {};
            var tempVals = v.split(",");
            if(tempVals[0] !== ""){
              headers.map(function (u, j) {
                temp[u] = tempVals[j];
              })
              items.push(temp);
            }
          }
        });
        //console.log('items', items);
        //console.log('lines', lines);
        var htmlStr = `${htmlStrFront}
        ${generatePage(gridConfig, items)}
        ${htmlStrBack}`;
        var result = await writeFileAsync("./temp/output.html", htmlStr);
        console.log("File Printed");

    }
    catch (err) {
        console.log('ERROR:', err);
    }
}
main();
