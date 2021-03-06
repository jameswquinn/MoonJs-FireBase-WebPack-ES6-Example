global.Moon = require('moonjs') // https://github.com/kbrsh/moon/issues/145 (m-for)
import * as firebase from 'firebase'
import './style.scss'

firebase.initializeApp({
  apiKey: 'AIzaSyDG6Wvi41EkXB88M2tZTR3WOWEj4PvTtOI',
  authDomain: 'moon-firebase-chat.firebaseapp.com',
  databaseURL: 'https://moon-firebase-chat.firebaseio.com',
  projectId: 'moon-firebase-chat',
  storageBucket: '',
  messagingSenderId: '527682524924'
})

const fbDb = firebase.database()

window.onload = () => {

  const app = new Moon({
    el: '#app',
    data: {
      newMessage: '',
      messages: []
    },
    methods: {
      addMessage: function() {
        let that = this,
            newMessage = this.get('newMessage') // get the input value

        // add message to firebase
        if(newMessage.length !== 0 && newMessage.trim() !== '') {
          fbDb.ref('messages').push(newMessage).then(() => {
            that.callMethod('getMessages', [])
            that.set('newMessage', '')
          })
        }
      },
      getMessages: function() {
        let that = this,
            msgs = []

        // get the last 15 messages from firebase
        fbDb.ref('messages').limitToLast(15).once('value').then(snapshot => {
          snapshot.forEach(snapshot => {
            msgs.push(snapshot.val())
          })
        }).then(function() {
          that.set('messages', msgs)
        })
      }
    },
    template: `<div class="content">
                 <ul>
                   <li m-for="message in messages">{{message}}</li>
                 </ul>
                 <div class="bottom">
                   <input placeholder="What's your message" m-model="newMessage" m-on:keyup.enter="addMessage" />
                 </div>
               </div>`,
    hooks: {
      mounted: function() {
        this.callMethod('getMessages', []) // Get messages on load

        // if new message, call function getMessages
        fbDb.ref('messages').on('child_added', snapshot => {
          app.callMethod('getMessages', [])
        })
      }
    }
  })

} // onload
