const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button') 
const $locationFormButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessage = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild
    //Height of the last message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight = newMessageMargin

    //Visible Height
    const visibleHeight = $messages.offsetHeight
    //Height of messages container
    const contentHeight = $messages.scrollHeight
    //How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (contentHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }


}

socket.on('theMessage', (message) => {
    console.log(message)  
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A')
    })   
    $messages.insertAdjacentHTML('beforeend', html)   
})

socket.on('sendLocation', (url_message) => {
    console.log(url)
    const html_url = Mustache.render(locationMessage, {
        username: message.username,
        url: url_message.url,
        createdAt: moment(message.createdAt).format('h:mm A') 
    })

    $messages.insertAdjacentHTML('beforeend', html_url)
    autoscroll()
})

socket.on('roomData', ( room, users ) => {
    const html  = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.on('mank', (mankk) => {
    console.log(mankk)
})

socket.on('disconnect', (mannnn) => {
    console.log(mannnn)
})

$locationFormButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser') 
    }

    $locationFormButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('Location Shared')
            $locationFormButton.removeAttribute('disabled')
        })
        console.log(`https://google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`)        
    })
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    //Disable form
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        //Re-enable form
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        
        if (error){
            return console.log(error)
        }
        console.log('The message was delivered')
    })
})
  
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})