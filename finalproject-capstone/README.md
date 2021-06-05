# Disciplinapp

Hi, this is Disciplinapp. An app created by me (Juliana Fernández) for my Harvard CS50-Web's final proyect.

I deployed my project in AWS, so if you want to see it go to: 
http://disciplinapp-env.eba-d2puts6q.sa-east-1.elasticbeanstalk.com/

## How to run my app

To run this app just use: python manage.py runserver.

## What is it about?

With disciplinapp i wanted to create an app that help users to follow certain study methods, that would improve their concentraition and efficiency in their study schedules.
As a user of this methods i knew that sometimes is hard to remember the tasks you must do, and that sometimes you don't remember to set up an alarm or clock for your study sessions.
That's why i wanted to build in one single app the tools that i think would help people to set up a good study session, using diferent methods, building to-do lists and seting up a specific amount of time for their tasks or sessions, time that would be displayed as a countdown timer, allowing the stundent to track the time they have been studying or the remaining time of the study session.

In the app there are four main study methods that you can choose:
1.Pomodoro
2.Personalized Sessions
3.Get Things Done
4.Do It Tomorrow

In Pomodoro the app takes you to an explanation view where i brevely tell you what Pomodoro is about, and then it takes you inmediately to the countdown timer, which is pre-set with 25 minutes, because that's how long a pomodoro session takes.

In the Persoalized sessions, as the title says, you could set up the time that you want for a study session, and then the app takes you to the countdown timer, that will display the time that you specifies earlier.

An important aspect is that this two options does not require the user to be loged in, thats because i wanted to let some options free of this requirement if a user don't wanted to log in, also, login in takes time, and because at the end what i seek for is for an eficient and fast form of seting up a sttudy session. Also, the functionality of this two methods does not require any storage in the database, so did not need the user to identify her/him self.

In the Get Things Done (GTD) and Do It Tomorrow (DIT) methods i used mainly the same process and tools, they allow the users to create to-do lists, prompting them to input one or more tasks at the same time, and then storing them in the models of the database. Every task contains the information of the task itself, and the method from where it was created. So in that way i use the same mechanism for both methods, but i could display the tasks in them separately because of method-value in te tasks.

In this two methods (GTD and DIT), once the tasks are saved, the app takes the user to a view called My Task List, which displays all the tasks a user have made in every method, and at the same time in every method are displayed two lists, one for "today tasks" and the other for "previous tasks" - in GTD, or "tomorrow tasks" - in DIT.

Every tasks name or title is a link that allows the user to see the content of the task and delete it, and a green button to start the countdown timer, which would be set up with the time specified for the user for that task.

As i mentioned, because this two methods need the data/tasks to be stored in the database for every user, they require the user to be loged in, thats why if you try to access this methods, the app will redirecct you to the Log In view.

## Components

Disciplinapp is an app built, in the backend, with Python using the framework Django, and in the frontend, with JavaScript and the React library.

### Backend

In Django, the main characteristics of the app are contained in the models.py and views.py documents.

For my purpose, in models.py i created two models, one to keep track of users (wich is created with the AbstractUser), and the other to keep track of their tasks, using the user as a foregin key, to asociate a task with their owner/creator/user. The other fields of the model were created for every type of data that i would store, and finally this model is serialized to allow me to send the data via JsonResponse to Javascript-React.

In views.py the main functions are:

index: which render index.html when the request method is GET (url-path "/").

methods: which render method.html when the request method is GET (url-path "methods/AnyMethod>").

make_list: which is the main function in the used as an internal API because it handles the storage of the tasks that has been created via POST, also before saving the data related with the time of the task, i had to "serialize" the data to properly save it, because of the lack of coherence between browsers in their input type "time" that made me use type "number", and then on this function organize the values of the inputs.
Also via PUT it handles two types of fetch requests, "delete" which deletes the task and "status" which updates the satus of the task to "Done" when the user finish the time specified for the task.
And finally via GET handles the request made by fetch, to display the tasks in lists, depending first in its method-value, making a query for the tasks that have the method requested, and then dividing them into two lists, depending on their datetime-value of creation, returning two lists as a JsonResponse with all the tasks that the loged user has in the requested method, and displayed in two lists, one for "today tasks" and the other for "previous tasks" - in GTD, or "tomorrow tasks" - in DIT.

mylist: which render mylist.html when the request method is GET (url-path "mylist"). Also has login required decorator because as i mentioned before, a list of tasks is something that only a loged user has access.

counter: which render counter.html when the request method is GET (url-path "counter").

login_view: which render login.html when the request method is GET (url-path "login").

logout_view: which redirect the user to the app's homepage (index).

register: which render register.html when the request method is GET (url-path "register").

Finally, the templates used were the mentioned before, plus the layout template (layout.html).

### Frontend

#### JavaScript - React

The app mainly uses React to display and deal with all the information updating (via fetchs).

This code is contained in the document disciplinapp.js in the static folder.

The structure of the code is mainly organized by the window.location object, because i use the window.location.pathname to know where and when to display every block of code.
So basically, when the app is in certain url-path, the Js-react code displays the information that is suposed to display in that view.

The main parts of the js-react code were made to deal with displaying multiple tasks (in the to-do lists) or inputs (in the form view) using arrays in the state of the components, and updating the state, concatenating or deleting elements in the array, via setstate. Also, indicating inside the component the characteristics of the elements that are inside the arrays and displayed by the component.

The other principal element in the code is the component of the countdown timer, which i had to program by my own because i didnt find the code for a countdown timer that were made for my app needs, so i decided to do it myself. This component is feed with the time especified in every task, or pre-set by Pomodoro, or set in the Personalized sessions, by "downloading" the data of the hours, minutes and seconds from the sessions.storage.
The time-data of every task or every method is stored in the session.storage once the "start now!" button is clicked, and that's how the timer have access to the data, set the clock, and display the countdown in the app.

Almost all the components or elements in the multiple views of the app (except log in and register) are displayed by JS-React, and as i said before it comunicates with the server side via fectchs, especifically with the make_list function in views.py already mentioned before.

#### CSS

Another important component that i wanted to use in this app was CSS, especially exploring the shadows properties of the text and the boxes, so i can play around with elements that appears to be illuminated by a ligth source, also to add some dimension to the objects.

Other CSS property that i used a lot was the animations, which you can see displayed in the clocks and the Logo of the app in the Homepage, and in the Countdown timer.

Finally, i used Flexbox, media queries and a little bit of Grid (among meta tags in the html of layout.html) to made the app mobile-responsive.

#### Others

The others folder inside the static folder, just have the image of the clock that i used in the index page.

#### Spotify

In counter.html i added a Spotify tag provided by Spotify for developers, which append to the html view a Spotify music player of a specific album. I choose this option because i think is a good idea (and less distracting) to just play and listen an especific album of classic music.


## Requirements of the project

I think my project is distinct from other projects in this course because, despite i use some elements that i've learned during the course, like make and update lists and asociate model values in the database, i found my own way to apply this elements in an application that I conceived in my mind, not even using as reference any other app that i have seen on the web before. I made this app precisely because, as far as i know, there are not many apps about the ussage of study methods or that help users to set up a timer for their study sessions.

Also i think my app has the complexity required for the final project, because i not just have to use all the previous knowlege obtained during the course, but i have to research a lot more by my own, learn to user React more in deept, work with new propeties in CSS and achieve a project that work simultaneously with frontend and backend laguages.

Finally, as i mentioned before, other requirements like having at least one model, using Django and JavaScript, and been mobile-responsive are met in the app.