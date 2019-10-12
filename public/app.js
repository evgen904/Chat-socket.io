const socket = io();

Vue.component('chat-message', {
  props: ['message', 'user'],
  template: `
    <div class="message" :class="{'owner': user.id === message.id}">
      <div class="message-content z-depth-1">
        {{ message.name }}: {{ message.text }}      
      </div>    
    </div>
  `
});

new Vue({
  el: '#app',
  data: {
    message: '',
    messages: [],
    users: [],
    user: {
      name: '',
      room: ''
    }
  },
  methods: {
    sendMessage() {
      const message = {
        text: this.message,
        name: this.user.name,
        id: this.user.id
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

      // прослушка, получение список всех пользователей
      socket.on('users:update', users => {
        // переопределяем массив, чтобы не было мутаций
        this.users = [...users];
      });

      socket.on('message:new', message => {
        this.messages.push(message);

        scrollToButton(this.$refs.message);
      })

      scrollToButton(this.$refs.message);
    }
  },
  created() {
    const params = window.location.search.split('&');
    const name = params[0].split('=')[1].replace('+', ' ');
    const room = params[1].split('=')[1].replace('+', ' ');

    this.user = {name, room};

    console.log(this.user)
  },
  mounted() {
    socket.emit('join', this.user, data => {
      if (typeof data === 'string') {
        console.error(data);
      } else {
        this.user.id = data.userId;
        this.initializeConnection();
      }
    });
  }
});

function scrollToButton(node) {
  setTimeout(() => {
    node.scrollTop = node.scrollHeight;
  })
}
