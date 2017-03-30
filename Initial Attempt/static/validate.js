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

         if( !isToolboxFileName(file.name)){
            $("#submit_button").prop("disabled", true);
            alert("File must use .txt extension");
         }

         else if (fileSize > 2*MB_SIZE){
            $("#submit_button").prop("disabled", true);
            alert("File must be less than 2MB");
         }

         else if( !isToolboxFormat(contents) ){
            $("#submit_button").prop("disabled", true);
            alert("The selected file's format doesn't look like toolbox data!");
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
   function isToolboxFileName(fileExtension){
      var acceptableFormats = /(([A-Za-z_]*\.)+(txt|TXT)+|[A-Za-z_]+^.)/;

      return fileExtension.match(acceptableFormats);
   }
});
