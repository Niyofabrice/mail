document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);


  // Send email

  document.querySelector('#compose-form').addEventListener('submit', (event) => {
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
    fetch('emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
  });

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';



  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Get emails
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);
      // Show emails
      emails.forEach(email => {
            const element = document.createElement('div');
            element.style.border = "inset";
            if(email.read){
              element.style.background = "gray";
            }
            element.addEventListener('click', function() {
              load_email(email.id);
            });
            element.innerHTML = `${email.sender} - ${email.subject} - ${email.timestamp}`;
            document.querySelector('#emails-view').appendChild(element);
      });
  });

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}


function load_email(email_id){
  fetch(`emails/${email_id}`)
  .then(response => response.json())
  .then(result => {
    console.log(result)
    if(!result.read){
      fetch(`emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
    }
      const element = document.createElement('div');
      element.innerHTML = `<p><strong>From:</strong> ${result.sender}</p>
      <p><strong>To:</strong> ${result.recipients}</p>
      <p><strong>Subject:</strong> ${result.subject}</p>
      <p><strong>Timestamp:</strong> ${result.timestamp}</p>
      <p>${result.body}</p>
      <p>${result.archived ? '<button>archive</button>' : '<button>unarchive</button>'}</p>`;
      element.querySelector('button').addEventListener('click', remove_add_archive)
      document.querySelector('#emails-view').innerHTML = '';
      document.querySelector('#emails-view').appendChild(element);
  })
}


function remove_add_archive(){
  if(result.archived){
    fetch(`emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
  }
  else{
    fetch(`emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
  }
}