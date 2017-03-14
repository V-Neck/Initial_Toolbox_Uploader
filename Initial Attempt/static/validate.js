$(document).ready(function(){
   var toolboxPat = /\\[A-Za-z]+ \w+/;
   var MB_SIZE = Math.pow(10,6);

   $("#submit_button").prop("disabled", true);
   $("#file-submission").on("change", getFileText);
   function getFileText(event){
      var file = event.target.files[0];

      if (!file) {
         return;
      }

      var reader = new FileReader();
      reader.onload = function(event){
         var contents = event.target.result;
         var fileSize = contents.length;

         if( !isToolboxFile(file.name.split('.').pop())){
            $("#submit_button").prop("disabled", true);
            alert("File must use .txt extension");
         }

         else if (fileSize > 2*MB_SIZE){
            $("#submit_button").prop("disabled", true);
            alert("File must be less than 2MB");
         }

         else if( !isToolboxFormat(contents) ){
            $("#submit_button").prop("disabled", true);
            alert("The file selected doesn't look like a toolbox file!");
         }

         else{
               $("#submit_button").prop("disabled", false);
         }
      };
      reader.readAsText(file);
   }

   //Checks whether the text in the file is valid toolbox data
   function isToolboxFormat(fileText){
      var igts = fileText.split("\n\n");
      for(var i=0; i<igts.length; i++){
         lines = igts[i].split("\n");
         for(var j=0; j<lines.length; j++){
            if (!(lines[j].match(toolboxPat) || lines[j] == "")){
               return false;
            };
         }
      }
      return true;
   }

   //Checks file-extension is acceptable
   function isToolboxFile(fileExtension){
      var acceptableFormats = ['txt'];

      for(var i=0; i< acceptableFormats.length; i++){
         if (fileExtension == acceptableFormats[i]){
            return true;
         }
      }
      return false;
   }
});
