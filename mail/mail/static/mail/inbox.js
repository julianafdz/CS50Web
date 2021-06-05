document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Waiting for Form to be submitted
  document.querySelector('#compose-form').onsubmit = () => {
    send_email();
    return false;
  }
  
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-content').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function send_email() {

  //Send email
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      // Load sent mailbox page
      load_mailbox('sent');
  });

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-content').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Clean old data from page
  document.querySelector('#emails-view').innerHTML = '';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Create posts for emails
      emails.forEach(element => create_email(element, mailbox));
    
    });

}

function create_email(element, mailbox) {

  // Create a new email post
  const sender = document.createElement('div');
  sender.className = 'email_sender col-lg-4 col-sm-4';
  sender.innerHTML = element.sender;
  const subject = document.createElement('div');
  subject.className = 'email_subject col-lg-5 col-sm-5';
  subject.innerHTML = element.subject;
  const date = document.createElement('div');
  date.className = 'email_date col-lg-3 col-sm-3';
  date.innerHTML = element.timestamp;
  
  const email = document.createElement('div');
  email.className = 'email';
  email.append(sender, subject, date);
  email.addEventListener('click', () => view_email(element.id, mailbox));
  email.addEventListener('click', () => read(element.id));
  email.style.cursor = 'pointer';
  if (element.read == false) {
    email.style.fontWeight = 'bold';
  }
  else {
    email.style.backgroundColor = 'lightgrey';
  } 
  document.querySelector('#emails-view').append(email);

}

function view_email(mail_id, mailbox) {

  // Show the email's content and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-content').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Clean old data from page
  document.querySelector('#email-content').innerHTML = '';

  fetch(`/emails/${mail_id}`)
  .then(response => response.json())
  .then(email => {
      // Create page for email content
      let table = document.createElement('table');
      let keys = Object.keys(email);

      for (let key of keys) {
        if (key === 'sender' || key === 'recipients' || key === 'timestamp' || key === 'subject') {
          let title = document.createElement('strong');
          if (key === 'sender') {
            title.innerHTML = 'From: ';
          }
          else if (key === 'recipients') {
            title.innerHTML = 'To: ';
          }
          else {
            title.innerHTML = `${key.charAt(0).toUpperCase() + key.slice(1)}: `;
          }         
          let row = table.insertRow();
          let cell = row.insertCell();
          cell.appendChild(title);
          let content = document.createTextNode(email[key]);
          cell.appendChild(content);
        }
      }

      let reply_btn = document.createElement('button');
      reply_btn.className = 'btn btn-sm btn-outline-primary';
      reply_btn.innerHTML = 'Reply';
      reply_btn.addEventListener('click', () => reply(email));

      let hr = document.createElement('hr');
      let body = document.createElement('div');
      body.style.whiteSpace = 'pre';
      body.innerHTML = email.body;

      document.querySelector('#email-content').append(table, reply_btn, hr, body);

      let hr2 = document.createElement('hr');
      if (mailbox === 'inbox') {
        let archive_btn = document.createElement('button');
        archive_btn.className = 'btn btn-sm btn-outline-primary';
        archive_btn.innerHTML = 'Archive';
        archive_btn.addEventListener('click', () => archive(email));
        document.querySelector('#email-content').append(hr2, archive_btn);
      }
      else if (mailbox === 'archive') {
        let unarchive_btn = document.createElement('button');
        unarchive_btn.className = 'btn btn-sm btn-outline-primary';
        unarchive_btn.innerHTML = 'Unarchive';
        unarchive_btn.addEventListener('click', () => archive(email));
        document.querySelector('#email-content').append(hr2, unarchive_btn);
      }

  });

}

function reply(email) {

  // Show compose view
  compose_email();

  // Fill composition fields with email data
  document.querySelector('#compose-recipients').value = email.sender;
  let re = 'Re:';
  if (email.subject.indexOf(re) === -1) {
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  }
  else {
    document.querySelector('#compose-subject').value = email.subject;
  }
  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}.`;

}

function archive(email) {

  // Archive and Unarchive emails
  if (email.archived == true) {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
    .then(response => {
        // Print response
        console.log(response);
        // Load inbox page
        load_mailbox('inbox');
    });
  }
  else {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
    .then(response => {
        // Print response
        console.log(response);
        // Load inbox page
        load_mailbox('inbox');
    });
  }
    
}

function read(mail_id) {
  fetch(`/emails/${mail_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
  .then(response => {
      // Print response
      console.log(response);
  });
}