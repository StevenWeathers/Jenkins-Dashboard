var $consoleModal = $('#consoleModal');
$('body').on('click', "a.get-console-output", function(event){
  event.preventDefault();
  var $this = $(this);
  var lastBuildUrl = $this.data('lastbuild-url');
  var lastBuildName = $this.data('lastbuild-name');

  if (lastBuildUrl){
    $.ajax({
      url: '/getConsoleOutput',
      data: {
        "lastBuildUrl" : lastBuildUrl
      },
      beforeSend: function(){
        $consoleModal.find('.modal-title').text(lastBuildName + ' - Console Output');
        $consoleModal.find('.modal-body').html('Loading Console Data.');
        $consoleModal.modal('show');
      }
    }).done(function(data){
      $consoleModal.find('.modal-body').html('<pre>'+data+'</pre>');
    }).fail(function(){
      $consoleModal.find('.modal-body').html('Console Data Failed to Load.');
    });
  }
});
