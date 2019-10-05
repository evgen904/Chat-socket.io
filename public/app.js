const socket = io();

Vue.component('chat-message', {
  props: ['message'],
  template: `
    <div class="message">
      <div class="message-content z-depth-1">
        {{ message.text }}      
      </div>    
    </div>
  `
});

new Vue({
  el: '#app',
  data: {
    message: '',
    messages: []
  },
  methods: {
    sendMessage() {
      const message = {
        text: this.message
      }

      socket.emit('message:create', message, err => {
        if (err) {
          console.log(err);
        } else {
          this.message = '';
        }
      });
    },
    initializeConnection() {
      socket.on('message:new', message => {
        this.messages.push(message);
      })
    }
  },
  mounted() {
    this.initializeConnection();
  }
});
