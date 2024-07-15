document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Submit handler
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});


function send_email(event){
  event.preventDefault();

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;


  // Send request to backend
  fetch('emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result)
    load_mailbox("sent")
  });
}


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-details-view').style.display = 'none';



  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-details-view').style.display = 'none';

  // Get emails
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);
      // Show emails
      emails.forEach(email => {
            const element = document.createElement('div');
            element.className = "list-group-item";
            email.read ? element.style.background = "#d7d7d7" : element.style.background = "white";
            element.addEventListener('click', () => {
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
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-details-view').style.display = 'block';
    


    const element = document.createElement('div');
    element.innerHTML = `<p><strong>From:</strong> ${result.sender}</p>
    <p><strong>To:</strong> ${result.recipients}</p>
    <p><strong>Subject:</strong> ${result.subject}</p>
    <p><strong>Timestamp:</strong> ${result.timestamp}</p>
    <p>${result.archived ? '<button id="archive" class="btn btn-secondary">unarchive</button>' : '<button id="archive" class="btn btn-secondary">archive</button>'}</p>
    <hr>
    <p>${result.body}</p>
    <br>
    <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>`;



    element.querySelector('#archive').addEventListener('click', () => {
      fetch(`emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: !result.archived
        })
      })
      .then(() => {
        load_mailbox('archive');
      })
    })
    element.querySelector('#reply').addEventListener('click', () => {
      compose_email();

      document.querySelector('#compose-recipients').value = result.sender;
      let subject = result.subject
      if(subject.split(" ", 1)[0] != "Re:"){
        subject = "Re: " + subject;
      }
      document.querySelector('#compose-subject').value = subject;
      document.querySelector('#compose-body').value = `On ${result.timestamp} ${result.sender} wrote: ${result.body}`;
    })
    document.querySelector('#email-details-view').innerHTML = "";
    document.querySelector('#email-details-view').appendChild(element);

    // Set email as read
    if(!result.read){
      fetch(`emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
    }
  })
}