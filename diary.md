#### 14 April

- add bod colum in user model
- refactor the data posting to db
- birthday feature finished
- any can view the user media by pop up view
- refactor the neccessary posing feature

#### 13 April

- add post image model in the db
- refactor the create post and post fetch functions form the server side action
- refactor newfeed, addpost, homepage and studio components
- modify the posting feature and now user can post multiple image
- user can import muliple images and user can delete the images in the preview before posting
- user can view up to 3 photos and if user upload more than 3 , user can view the photo in pop up view
- refactor the comment box

#### 11 April

- start stories feature by using pop up view
- use shadcn component of carosel to view the multiple photos
- use overlay profiles components on the stories image
- add delete button for the stories
- add shadcn progress component to implement 5s sec time limit
- make sure the stories move another after 5 sec
- make sure the pop up it close after the stories are viewed
- change the logic of the post created time display
- activate the stories posting button

#### 14 March

- user status and posting finish .. user can post status and photo and video
- finsihed comment sending , comment like, comment delete
- post delete feature is also finished (only owner of the post can delete the post)

#### 13 March

- fetch user owned posts for the profile page
- fetch following posts for the home page
- post reaction for like and love

#### 12 March

- finished seach engine and user can search by name or username(userid)
- search feature is dynamic since the search listener will keep track of word by word which user type and display the ever changing result

#### 11 March

- used cloudinary to upload photo and photo has large size and we can store in the cloudinary and got the url to display ( need to explain more in term of UX)
- used zod library to check the form input string
- useRourter to refresh the page after user press update to engage UX

#### 10 March

- add the updating user detail feature using pop up view

#### 7 March

- implement testing for friend request sending feature and reject request

#### 6 March

- testing the follow user, and block user feature.

#### 4 March

- do the reresearch about java script testing tool kit and decide on jest javascrpt testing
- implement testing for webhook from clerk database user update, user create and user user delete

#### 25 Feb

- review and revisiion the project and fix the UI problem
- do research on deplaying kuma web on using netlify

#### 4 Dec

- refactor follow feature using Optimistic hook to get better user interaction and morte quicker responnd and if something happen or some error occur the follow button will change back immediately to follow

- use webhook event to fetch data from the clerk to sycn into mysql database

#### 15 Nov

- fix the problem of some client side component are fetching data using sever side component

- spend a lot of time beacuse after sign out form home page causing the error of call stack api and not direct to sign in page back

- there is another error that I was in the my website home page .. and I go to the clerk board and delete user and I go the home page (I write code for checking userid and if not found of to sign in ) and it go to sign in page as plan.. But after that I got error immediately showing'Unhandled Runtime Error

- spended the whole day to solve this there errors and finilly i solved all three

#### 7 Nov

- use sign in page as landing page
- look for svg picture for the landong page 2D- animantion

#### 31 Oct

- Finish ui for the home page and ready to merge to the home page
- all of the component are responsive and can use on the web and also on the mobie

#### 29 Oct

- I tried to use CurrentUser (severcomponent) and tried to fetch in the use client component.
- take a lot of time to fix this using useAuth (client sid ecomponent) . Don't work
- finally, found useUser and can fetch the avator image at the use client component

#### 28 Oct

- start home page ui since it is possible to write auth in the ui branch

#### 27 Oct

- embed clerk middleware and do researchs for illustration for landing page and collect materials

#### 26 Oct

- Change react to next.js at frontend for static and dynamic content like sever side rendering

#### 25 Oct

- sketch main structure and database in the easer.io

#### 16 Oct

- do researchs and learned about react and note.js

#### 11 Oct

- prepare project plan and submitted

#### REMINDER OF HOW TO RUN THE KUMA APP

- Start rendering - pnpm run dev

- Start NGROK - ngrok http http://localhost:3000

- Go to clerk dashboard > setting > webhook

- Change endpoint to (https://700a-2-99-205-125.ngrok-free.app)/api/webhooks/clerk

- You will get new endpoint when u start the sever

- Test the data to send and confirm as it is truly connected

- Pull the data base - pnpm exec prisma db pull

- Start the DATA Base - pnpm exec prisma studio

- Change the relation in data base - pnpm exec prisma db push
