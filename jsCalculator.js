
$(document).ready(function() {

  $('.runMath').click( function() {mathStuff();});
  //$('.mathInput').keyup( function() {mathStuff();});
//asdf
  function mathStuff(){

      var zeugsZumRechnen = $(".mathInput").val(), // input aus dem Textfeld, default ggf. zu Testzwecken vorhanden
          zeugsZumRechnenBackup = zeugsZumRechnen, zeugsZumRechnenBackupFiltered, // backup, da das andere ge�ndert wird (f�r whatever)
          zeugsZumRechnenVisual; // die visuelle Ausgabe, wegen dem Highlight der jeweiligen Schritte
      var patternEqual = /\=/g,
          patternComma = /\,/g,
          patternWhitespace = /\s/g,
          patternNotAllowed = /[^0-9\.\,\+\-\*\/\^\=\,\s\(\[\{\)\]\}]/g;
      var patternSign = [];                   // die Operatoren da reinspeichern, Priorit�t beim Rechnen geht vom Ende des Arrays zum Anfang (z.B. +/- als letztes)
          patternSign[0] = /[\+\-]/g,         // satzzteichen +/-
          patternSign[1] = /[\*\/]/g,         // satzzteichen */:
          patternSign[2] = /[\^]/g;           // satzzteichen ^  (Exponent)
      var patternBrackets = [/[\(\[\{]/g, /[\)\]\}]/g];     // Klammern {[/ �ffnend und schlie�end im Array
      var patternBracketsBlock = /\(.[^\(\)]*\)/;           // in () eingeklammerte Rechnung

      //var patternNumber = /\d*[\,\.]?\d\d*/g, // regEx f�r eine (ggf. mit Vorzeichen) Float-Zahl getrennt �ber , oder .
      var patternNumber = /[-+]?[0-9]*\.?[0-9]+/g, // regEx f�r eine Float-Zahl getrennt �ber , oder .
          patternBlockCurrent, patternMatches;
      var i, j, pairNumbers = [], pairOperation, pairResult, operatorAmount;
      var bremse = 0;

      // den (alten) Inhalt s�ubern
      $('.containerMathInner').replaceWith("<div class='containerMathInner'></div>");

      // Test, ob �berhaupt was da ist
      if (!zeugsZumRechnen) {
        $(".containerMathInner").append("<p class='inner'>no Input</p>");
        return;
      }

      // Test auf fremde Zeichen
      if (patternNotAllowed.test(zeugsZumRechnen)) {
        $(".containerMathInner").append("<p class='inner'>Invalid Character(s) found! Can not do math with that...</p>");
        return;
      }


      // etwas filtern: '=' entfernen; ',' zu '.' �ndern; leerzeichen entfernen
      zeugsZumRechnen = zeugsZumRechnen.replace(patternEqual, '');
      zeugsZumRechnen = zeugsZumRechnen.replace(patternComma, '.');
      zeugsZumRechnen = zeugsZumRechnen.replace(patternWhitespace, '');
      zeugsZumRechnen = zeugsZumRechnen.replace(patternBrackets[0], '(');
      zeugsZumRechnen = zeugsZumRechnen.replace(patternBrackets[1], ')');

      // ANFANG der Berechnung
      $(".containerMathInner").append("<p class='inner'> - Zwischenschritte - </p>");    // �berschrift der Zwischenschritte einf�gen
      zeugsZumRechnenBackupFiltered = zeugsZumRechnen; // die gefilterte Version des Inputs zwischenspeichern

      /*
      Die Idee:
      Der Priorit�t (Reihenfolge im patternSign-Array) nach die Berechnungen stufenweise durchf�hren.
      Die jeweiligen Stufen filtern die jeweiligen Zeichen mit den Zahlen rechts und links davon, die Zahlen werden dem Zeichen gerecht kombiniert.
      Das Ergebnis der Kombination ersetzt dann den dazugeh�rigen "Zahl-Zeichen-Zahl"-Block
      und die Schleife geht so lange bis keine dieser Bl�cke mehr �brig sind, und wiederholt dies auf allen Stufen runter, bis letztendlich nur noch eine Zahl �brig ist.
      */

      console.log('---', 'while-schleife', '---');
      var zwischenBlock = [], zwischenBlockCopy;
      while(!(zeugsZumRechnen.match(patternNumber).length===1)) {
        //zwischenBlock = zeugsZumRechnen.match(patternBracketsBlock)[0];
        zwischenBlock = zeugsZumRechnen;
        zwischenBlockCopy = zwischenBlock;
        if(zeugsZumRechnen.match(patternBracketsBlock)){
          zwischenBlock = zeugsZumRechnen.match(patternBracketsBlock)[0];
        zwischenBlockCopy = zwischenBlock;
          zwischenBlock = zwischenBlock.slice(1, zwischenBlock.length-1);
        }
        for (i=patternSign.length-1; i>=0; i--) {
              // Ausrechnen wieviele Zeichen, also Rechenschritte f�r die n�chste Loop, auf der Stufe i vorhanden sind.
            operatorAmount=zwischenBlock.match(patternSign[i]);
              // den regEx-Block bilden f�r Float-Zeichen[i]-Float
            patternBlockCurrent = new RegExp(patternNumber.source + patternSign[i].source + patternNumber.source, "g");

            if (operatorAmount) { // Schauen, ob �berhaupt was auf der [i]-ten Ebene zu Rechnen ist
                // Schleife f�hrt Berechnungen auf der [i]-ten Ebene aus, solange wie Rechen-Paare gefunden werden
                while(zwischenBlock.match(patternBlockCurrent)){
                    patternMatches = zwischenBlock.match(patternBlockCurrent)[0];  // ersten passenden "Zahl-Zeichen-Zahl"-Block rausfiltern
                    pairOperation = patternMatches.match(patternSign[i])[0]; // aus diesem Block die Zahlen als Array ([0] und [1]) ausschneiden
                    pairNumbers = patternMatches.match(patternNumber);       // aus diesem Block das Zeichen, also den Operator, herausfiltern
                    switch(pairOperation[0]){ // die zum Operator passende Rechnung durchf�hren, Ergebnis zwischenspeichern
                        case "+" : pairResult = Number(pairNumbers[0]) + Number(pairNumbers[1]); break;
                        case "-" : pairResult = Number(pairNumbers[0]) - Number(pairNumbers[1]); break;
                        case "*" : pairResult = Number(pairNumbers[0]) * Number(pairNumbers[1]); break;
                        case "/" : pairResult = Number(pairNumbers[0]) / Number(pairNumbers[1]); break;
                        case "^" : pairResult = Math.pow(Number(pairNumbers[0]), Number(pairNumbers[1])); break;
                        default: pairResult = 'ERROR'; // <- sollte eigentlich nie der Fall sein
                    }
                    console.log('zwischenschritt: ', patternMatches, pairOperation, pairNumbers, pairResult);
                      // visuelle Version zwischenspeichern und das benutzte Zahl-Zeichen-Zahl-Paar markieren
                    zeugsZumRechnenVisual=zwischenBlock.replace(patternMatches, "<span class='highlightedRed'>"+patternMatches+"</span>");
                    zeugsZumRechnenVisual=zeugsZumRechnen.replace(zwischenBlockCopy, '('+zeugsZumRechnenVisual+')');
                      // kurzschreibweise If-else, im Grunde einem Ergebnis ohne Vorzeichen, also negativen, ein + als Vorzeichen geben.
                    Number(pairResult) < 0 ? (pairResult=round(pairResult, 4)) : (pairResult='+'+round(pairResult,4));
                      // interne Version anpassen, also das ZZZ-paar mit dem Ergebnis ersetzen
                    zwischenBlock=zwischenBlock.replace(patternMatches, pairResult);

                      // Ausgabe der visuellen Version (ohne dem Ergebnis, dies folgt in n�chstem Durchlauf und ganz zum Schluss
                    $(".containerMathInner").append("<li class='inner wide'>"+zeugsZumRechnenVisual+"</li>");

                }
            }


        }
      zeugsZumRechnen = zeugsZumRechnen.replace(zwischenBlockCopy, zwischenBlock);
      //zeugsZumRechnen = zeugsZumRechnen.replace(/\-{2}/g, '+');
      }
          // Ausgabe des Endergebnisses in dem Zwischenschritte-Block
      $(".containerMathInner").append("<li class='inner wide'>"+zeugsZumRechnen+"</li>");
          // Ausgabe des gefilterten Inputs und des Ergebnisses nochmals ganz oben
      $(".containerMathInner").prepend("<p class='inner wide'>"+zeugsZumRechnenBackupFiltered+'= '+zeugsZumRechnen+"</p>");

  }


  $(".hideNext").click(function(){
      $(this).next().toggle("slow");
  });

  $(".run2").click(function stuff() {
      var i, randomColorsVar, thisObject, currentBgColorHSL;
      var ids = "demo1, demo2, demo3, demo4, demo5, demo6, demo7, demo8, demo9, demo10, demo11, demo12"
      var numbers = ids.split(", ");
      for (i=0; i < numbers.length; i++) {
          thisObject = document.getElementById(numbers[i]);
          clearInterval(thisObject.dataset.timerId);

          thisObject.innerHTML = 'TEsTzeile, ob man alles auch gut lesen kann! 1123+613,6=0123-8';
          thisObject.style = randomColors();

          currentBgColorHSL = thisObject.style.backgroundColor.match(/\d?\d?\d/gi); // jeweiligen Hintergrund auslesen und nur RGB-Werte ausspucken
          currentBgColorHSL = rgbToHsl(currentBgColorHSL[0],currentBgColorHSL[1],currentBgColorHSL[2]); // die ^ RGB-Werte in HSL umwandeln

          thisObject.dataset.bgcolor = currentBgColorHSL;
          //(function (object, i) { thisObject.addEventListener("mouseover", function() {fadeBgColor(this, i);}) })(this, i); // nur object(this) n�tig
      }
  });

  $("body").on( "mouseover", ".inner", function fadeGrey () {
        var object = this;
        clearInterval(object.dataset.timerId);
        var greyIntensity = 20;
        object.dataset.timerId = setInterval(frame, 50); // Id "global" in dem jeweiligen Dataset gespeichert
        function frame() {
            if (greyIntensity > 100) {
                clearInterval(object.dataset.timerId);
            }
            else {
            greyIntensity += 5;
            object.style.backgroundColor = "hsl(0, 0% , " + greyIntensity + "% )";
            object.style.color = "hsl(0, 0%, " + (100-greyIntensity) + "% )";
            object.style.textShadow = "hsl(0, 0%, " + (100-greyIntensity) + "% )";
            }
        }
  });

  $(".usables").on( "mouseenter", "[data-timerId]", function fadeBgColor (){
        var object = this;
        var hslH =object.dataset.bgcolor.split(',')[0]; // hsl aufteilen in ton, s�ttigung, helligkeit.
        var hslS =object.dataset.bgcolor.split(',')[1];
        var hslL =parseInt(object.dataset.bgcolor.split(',')[2]);
        var greyIntensityScale = round((100-parseInt(object.dataset.bgcolor.split(',')[2]))/50, 2) ;
            // Schritte f�r die helligkeit-Erh�hung individuell ausrechnen (damit die Animation von "sehr dunkel -> wei�" gleich lange dauert wie "weniger dunkel -> wei�")
        var object;
        clearInterval(object.dataset.timerId);
        var greyIntensity = 0;
        object.dataset.timerId = setInterval(frame, 50); // Id "global" in dem jeweiligen Dataset gespeichert
        function frame() {
            if (greyIntensity > 100) {
                clearInterval(object.dataset.timerId);
            }
            else {
              //$('object').css({"background-color":"hsl("+hslH+", "+hslS+"%, "+(hslL+greyIntensity)+"% )" });
            object.style.backgroundColor = "hsl("+hslH+", "+hslS+"%, "+(hslL+greyIntensity)+"% )";
            greyIntensity += (greyIntensityScale)*3;
            object.style.textShadow = "hsl(0, 0%, " +(100-greyIntensity)+"% )";
            }
        }
  });

  function randomColors() { // irritierender Funktionsname. Enth�lt alle m�glichen style-Formatierungen als string. Formatierungen basieren auf zufallsgenerierte Zahlen.
    var rndhsl1a = Math.floor(Math.random() * 360 + 1);
    var rndhsl1b = Math.floor(Math.random() * 50 + 50 + 1);
    var rndhsl1c = Math.floor(100- (Math.random() * 50 + 50) + 1);

    var rndhsl_background_all = " hsl(" + rndhsl1a + ", " + rndhsl1b + "% , " + rndhsl1c + "% )";
    var rndhsl_text_all = (rndhsl1c > 40 ) ? "black": "white";
    var rndhsl_textshadow_all = " hsl(" + rndhsl1a + ", " + 100 + "% , " + Math.min((rndhsl1c+30),100) + "%)";
    var rndhsl_textshadow2_all = " hsl(" + rndhsl1a + ", " + rndhsl1b + "% , " + Math.min((rndhsl1c+30),100) + "%)";

    var style1_all;
    style1_all = "background-color: " + rndhsl_background_all+ ";";
    style1_all +="color: " + rndhsl_text_all+ ";";
    style1_all +="text-shadow: 1px 1px 4px"+rndhsl_textshadow2_all+", 1px -1px 4px "+rndhsl_textshadow2_all+", -1px 1px 4px "+rndhsl_textshadow2_all+", -1px -1px 4px "+rndhsl_textshadow2_all+"";
    style1_all +=", 1px 1px 1px "+rndhsl_textshadow_all+", 1px -1px 1px "+rndhsl_textshadow_all+", -1px 1px 1px "+rndhsl_textshadow_all+", -1px -1px 1px "+rndhsl_textshadow_all+";";
    return style1_all;
  }

  function rgbToHsl(r, g, b) { // copy/paste aus'm Netz. Zum Schluss etwas mit Runden erg�nzt.
    r /= 255, g /= 255, b /= 255;

    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
      h = s = 0; // achromatic
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }

      h *= 60;
    }

    return [ Math.round(h), Math.round(s*100), Math.round(l*100) ];
  }

  function round(value, decimals) { // copy/paste aus'm Netz.
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);

  }

});
