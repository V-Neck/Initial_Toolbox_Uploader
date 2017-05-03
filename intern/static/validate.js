$(document).ready(function(){
   var TOOLBOXPAT = /\\[A-Za-z]+ \w+/;
   var MB_SIZE = Math.pow(10,6);
   var STDMKRS = ["\\t ",
                  "\\f ",
                  "\\g ",
                  "\\l ",
                  "\\m "];
   var STDINTERP = {"\\t ":"text",
                  "\\f ":"free translation",
                  "\\g ":"gloss",
                  "\\l ":"language",
                  "\\m ":"morphemes"}
   // This was going to be a FormData object, but that only has spotty support
   // across browsers
   var uploadData = {};
   var ACCEPTABLEINTERPRETATIONS = {"w": ["words", "text"],
                  "m": ["morphemes", "morphs", "morph"],
                  "g": ["glosses", "gloss"],
                  "pos": ["part of speech", "pos", "parts of speech"],
                  "t": ["translation", "transliteration", "free translation"],
                  "l" : ["translation", "literal translation"]};

   $('.confirm').hide();

   $("#file_button").prop("disabled", true);

   $("#file_button").on("click", function(){
      renderConfirmationPage(uploadData);
   });

   $("#final_button").on("click", function(){
      uploadData['tier_map'] = genTierMap(getIntreptations());
      console.log(uploadData);
      if(validUserInput(uploadData, true)){
         $.ajax({type: 'POST',
            contentType: 'application/json',
            dataType : 'json',
            url: 'http://127.0.0.1:5000/upload',
            data: JSON.stringify(uploadData)
         });
      }
   });

   $("#file-submission").on("change", getFileText);

   function getFileText(event){
      var userFile = event.target.files[0];

      if (!userFile) {
         return;
      }

      var reader = new FileReader();
      reader.onload = function(event){
         var contents = event.target.result;
         var fileSize = contents.length;

         /*
         Verify that the file is valid
         */

         //Checks file extension is txt
         if( !isToolboxFileName(userFile.name)){
            $("#file_button").prop("disabled", true);
            alert("File must use .txt extension");
         }

         //Checks file is less than 2 MB
         else if (fileSize > 2*MB_SIZE){
            $("#file_button").prop("disabled", true);
            alert("File must be less than 2MB");
         }

         //Checks if file matches format of toolbox data
         else if( !isToolboxFormat(contents) ){
            $("#file_button").prop("disabled", true);
            alert("The selected file's format doesn't look like toolbox data.");
         }

         else{
               $("#file_button").prop("disabled", false);
               uploadData["file"] = contents;
         }

         //These are the markers we find in the tb data
         var markers = new Set(getMarkers(contents));

         //This is the aligngment between tiers and markers which is inferred
         //Used as defaults on marker-alignment confirmation page
         uploadData["markers"] = markers;

         if (setEq(markers, new Set(STDMKRS))){
            //Create a json file which associates the std mrks to xigt tiers
            //Below is an attempt.
            /*guessedAlignment = {
                         "\\t": "w",
                         "\\m": "m",
                         "\\g": "g",
                         "\\p": "pos",
                         "\\f": "t"
                     }*/
            uploadData["used_std_mkrs"] = true;
         }

         else {
            uploadData["used_std_mkrs"] = false;
         }
      };
      reader.readAsText(userFile);
   }

   function renderConfirmationPage(userUpload){
      var userMarkers = userUpload['markers'];
      //TODO fix spaghetti code
      $('.upload').hide();
      $('.render').remove();

      var toolboxLines = wrappedToolboxLines(userUpload['file']);
      for(var line of Object.keys(toolboxLines)){
         var mkrListItem = "<td class='right-aligned'>" + line + "</td>"
         mkrListItem += "<td>" + toolboxLines[line] + "</td>";
         $('#sample_file').append("<tr class='render'>" + mkrListItem + "</tr>");
      }

      for(var mkr of userMarkers){
         //Add way to identify thing to change

         var mkrTableRow = "<td>" + mkr + "</td>";
         var cleanMkr = mkr.slice(1).toString();
         var mkrOptions = "<select id=combo-" + cleanMkr + " name='" + mkr +"'>";
         for(let mkrInterp of STDMKRS){
            mkrOptions += "<option value=" + STDINTERP[mkrInterp] + ">" + STDINTERP[mkrInterp] + "</option>";
         }
         mkrOptions += "</select>"
         mkrTableRow += "<td>" + mkrOptions + "</td>"

         $('#interpretations').append("<tr class='render'>" + mkrTableRow + "</tr>");
         $('#combo-' + cleanMkr).combify();
      }

      $('.confirm').show();
   }

   /*
      Validates various information the user has input including:
         There is a mapping from the toolbox markers used to tier types
            "tier_map"
         Their igts used \\id and \\ref
            "igt_attribute_map"
         The mapping is either one-to-one, or many-to-one (no one-to-many or many-many-many)
   */
   function validUserInput(uploadData, debug){
      return debug;
   }

   //Checks whether the text in the file is valid toolbox data
   function isToolboxFormat(fileText){
      var igts = fileText.split("\n\n");
      for(var i=0; i<igts.length; i++){
         lines = igts[i].split("\n");
         for(var j=0; j<lines.length; j++){
            if (!(lines[j].match(TOOLBOXPAT) || lines[j] == "")){
               return false;
            };
         }
      }
      return true;
   }

   //Checks file-extension is acceptable
   function isToolboxFileName(fileExtension){
      var acceptableFormats = /(([A-Za-z_]*\.)+(txt|TXT)+|[A-Za-z_]+^.)/;

      return fileExtension.match(acceptableFormats);
   }

   function getMarkers(contents){
      var markerFormat = /\\[A-Za-z_]+ /g;
      return contents.match(markerFormat);
   }

   //Checks if two Sets are mutual subsets, and thus equal 'sets'
   function setEq(s1, s2){
      if (s1.length !== s2.length){
         return false;
      }
      return isSubset(s1,s2) && isSubset(s2,s1);
   }

   //checks if Set s1 is subset of s2
   function isSubset(s1, s2){
      var flag = true;

      for(let i of s1.values()){
         flag = true;
         for(let j of s2.values()){
            if(i == j){
               flag = false;
               break;
            }
         }
         //If flag here, then some value i in s1 is not present in s2
         if(flag) break;
      }

      return !flag;
   }

   function isOneToOne(mapping){
      return true;
   }

   //Returns the first igt in toolbox file, with lines wrapped
   // markers : file text
   function wrappedToolboxLines(toolboxFile){
      //TODO Refactor with regex
      var mkrsAndLines = {}
      for(var mkr of toolboxFile.split('\n')){
         var key = mkr.split(" ")[0];
         var value = mkr.split(" ").slice(1).join(' ');
         if(mkrsAndLines.hasOwnProperty(key)){
            if(key == "\\ref"){
               break;
            }
            value = " " + value;
            mkrsAndLines[key] += value;
         }
         else {
            mkrsAndLines[key] = value;
         }
      }
      return mkrsAndLines;
   }

   //Grabs form data and puts it into uploadData
   function getIntreptations(){
      return $('#marker-checker').serializeArray().reduce(
         function(obj, item){
            obj[item.name] = item.value.toLowerCase();
            return obj;
         },
      {});
   }

   function genTierMap(marker_interps){
      var tierMap = {}
      var acceptableInterpretations = Object.keys(ACCEPTABLEINTERPRETATIONS);
      for(var defaultMkr of acceptableInterpretations){
         for(var userMkr of Object.keys(marker_interps)){
            if(ACCEPTABLEINTERPRETATIONS[defaultMkr].includes(marker_interps[userMkr])){
               tierMap[userMkr] = defaultMkr;
               break;
            }
         }
         if(!(userMkr in tierMap)){
            console.log(tierMap);
            //alert("I'm not sure which marker has the interpretation of " + ACCEPTABLEINTERPRETATIONS[defaultMkr][0]);
         }
      }
      return tierMap;
   }
});
