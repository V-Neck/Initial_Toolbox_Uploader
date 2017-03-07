$(document).ready(function(){
   var toolboxPat = /\\[A-Za-z]+ \w+/;
   var MB_SIZE = Math.pow(10,6);

   $("#submit_button").prop("disabled", true);
   $("#file-submission").on("change", getFileText);
   function getFileText(event){
      var file = event.target.files[0];
      if (!file) {
         return ;
      }

      var reader = new FileReader();
      reader.onload = function(event){
         var contents = event.target.result;
         var fileSize = contents.length;

         if (fileSize > 2*MB_SIZE){
            $("#submit_button").prop("disabled", true);
            alert("File must be less than 2MB");
         }

         else if( !isToolboxFile(contents) ){
            $("#submit_button").prop("disabled", true);
            alert("The file selected doesn't look like a toolbox file!");
         }
         else{
               $("#submit_button").prop("disabled", false);
         }
      };
      reader.readAsText(file);
   }

   function isToolboxFile(fileText){
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
});