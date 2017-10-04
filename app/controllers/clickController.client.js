'use strict';

(function () {

   var addButton = document.querySelector('.btn-add');
   var deleteButton = document.querySelector('.btn-delete');
   var clickNbr = document.querySelector('#click-nbr');
   var apiUrl = appUrl + '/api/:id/clicks';
   var addChoiceButton = document.querySelector('#addchoice');
   var dForm = document.querySelector('#form-group');
   
   function addFormGroup (form, number) {
      var newForm = 'form-group><input type="text" class="form-control" name="choice['+number+']" placeholder="choice'+number+'"></form-group>';
      form.innerHTML += newForm;
   }
   
   ajaxFunction.ready(ajaxFunction.ajaxRequest('GET', appUrl + '/main/new', function(){
      addChoiceButton.addEventListener('click', function () {
        alert("clicked"); 
      });
   }, false));
   


   function updateClickCount (data) {
      var clicksObject = JSON.parse(data);
      clickNbr.innerHTML = clicksObject.clicks;
   }

   ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, updateClickCount));

   addButton.addEventListener('click', function () {

      ajaxFunctions.ajaxRequest('POST', apiUrl, function () {
         ajaxFunctions.ajaxRequest('GET', apiUrl, updateClickCount);
      });

   }, false);

   deleteButton.addEventListener('click', function () {

      ajaxFunctions.ajaxRequest('DELETE', apiUrl, function () {
         ajaxFunctions.ajaxRequest('GET', apiUrl, updateClickCount);
      });

   }, false);

})();
