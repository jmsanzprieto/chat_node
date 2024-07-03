$(function () {
    var socket = io();
    var username = '';
    var privateChatUser = '';

    $('#nameModal').modal({
        backdrop: 'static',
        keyboard: false
    });

    $('#saveName').click(function() {
        username = $('#username').val().trim();
        if(username) {
            $('#nameModal').modal('hide');
            socket.emit('set username', username);
        } else {
            alert('Por favor, introduce tu nombre');
        }
    });

    $('#form').submit(function(e) {
        e.preventDefault();
        var message = $('#input').val();
        if(message) {
            socket.emit('chat message', { name: username, msg: message });
            $('#input').val('');
        }
        return false;
    });

    $('#private-form').submit(function(e) {
        e.preventDefault();
        var message = $('#private-input').val();
        if(message && privateChatUser) {
            socket.emit('private message', { to: privateChatUser, from: username, msg: message });
            $('#private-messages').append($('<li>').text('Tú: ' + message).addClass('list-group-item'));
            $('#private-input').val('');
        }
        return false;
    });

    socket.on('chat message', function(msg) {
        $('#messages').append($('<li>').text(msg).addClass('list-group-item'));
        $('#messages').scrollTop($('#messages')[0].scrollHeight);
    });

    socket.on('update users', function(users) {
        $('#user-list').empty();
        users.forEach(function(user) {
            if(user !== username) {
                $('#user-list').append($('<li>').text(user).addClass('list-group-item').click(function() {
                    privateChatUser = user;
                    $('#privateChatModalLabel').text('Chat Privado con ' + user);
                    $('#privateChatModal').modal('show');
                }));
            }
        });
    });

    socket.on('private message', function(data) {
        const { from, msg } = data;
        if (from === privateChatUser) {
            $('#private-messages').append($('<li>').text(from + ': ' + msg).addClass('list-group-item'));
        } else {
            alert('Nuevo mensaje privado de ' + from);
        }
    });
});