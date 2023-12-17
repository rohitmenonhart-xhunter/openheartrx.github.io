
// Your Firebase configuration comes here
var firebaseConfig = {
    // Add your Firebase config here
apiKey: "AIzaSyCKuoLKspUfEKdkexgO7HD9yb0C32lFI9I",
authDomain: "esp-location-56ece.firebaseapp.com",
databaseURL: "https://esp-location-56ece-default-rtdb.firebaseio.com",
projectId: "esp-location-56ece",
storageBucket: "esp-location-56ece.appspot.com",
messagingSenderId: "415169225788",
appId: "1:415169225788:web:0780c061338be738b8cf39",
measurementId: "G-NP5SHD0WWD"
};

firebase.initializeApp(firebaseConfig);

// Reference to the Firebase Realtime Database
var database = firebase.database();
var messagesRef = database.ref('messages');

// Function to display the list of students with markers for unread messages
// Function to display the list of students with markers for unread messages
function displayStudentList() {
    // Fetch student names and unread message status from the database
    messagesRef.on('value', function(snapshot) {
        var studentList = document.querySelector('.student-list');
        studentList.innerHTML = '';

        var students = {};

        snapshot.forEach(function(childSnapshot) {
            var studentName = childSnapshot.val().sender;

            // If student entry doesn't exist, create one
            if (!students[studentName]) {
                students[studentName] = {
                    unread: false, // Initialize unread status
                    inChat: false   // Initialize in-chat status
                };
            }

            // Check if the message is unread
            if (childSnapshot.val().status === 'Unread') {
                students[studentName].unread = true;
            }
        });

        // Display students with markers for unread messages
        Object.keys(students).forEach(function(studentName) {
            var listItem = document.createElement('div');
            listItem.className = 'student-list-item';
            listItem.textContent = studentName;

            // Add a marker for unread messages
            if (students[studentName].unread) {
                listItem.innerHTML += ' <span class="unread-marker">●</span>';
            }

            // Add a green dot for in-chat status
            if (students[studentName].inChat) {
                listItem.innerHTML += ' <span class="active-dot">●</span>';
            }

            listItem.onclick = function() {
                markMessagesAsRead(studentName); // Mark messages as read
                selectStudent(studentName); // Display the chat
            };

            studentList.appendChild(listItem);
        });
    });
}


// Function to select a student and display their chat
function selectStudent(studentName) {
    var studentNameElement = document.querySelector('.student-name');
    studentNameElement.textContent = studentName;

    // Fetch and display the selected student's chat for the current counselor
    var currentCounselor = 'Counselor'; // Update this with the actual counselor's identifier
    messagesRef.orderByChild('sender').equalTo(studentName).on('value', function(snapshot) {
        var chatMessages = document.getElementById('counselorChatMessages');
        chatMessages.innerHTML = '';

        snapshot.forEach(function(childSnapshot) {
            var message = childSnapshot.val();
            // Only display messages for the current counselor or the student
            if (message.sender === studentName || message.sender === currentCounselor) {
                displayCounselorMessage(message.sender, message.message);
            }
        });
    });

    // Mark the selected student's messages as read
    markMessagesAsRead(studentName);
}
// Function to display a message in the chat window
function displayCounselorMessage(sender, message) {
    var chatMessages = document.getElementById('counselorChatMessages');
    var messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = '<p><strong>' + sender + ':</strong> ' + message + '</p>';
    chatMessages.appendChild(messageElement);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to send a message as a counselor
function sendCounselorMessage() {
    var messageInput = document.getElementById('counselorMessageInput');
    var messageText = messageInput.value.trim();
    var studentName = document.querySelector('.student-name').textContent;

    if (messageText !== '') {
        messagesRef.push({
            sender: 'Counselor',
            message: messageText,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            status: 'Unread'
        });

        // Display the sent message in the chat window
        displayCounselorMessage('Counselor', messageText);

        // Mark the sent message as read for the selected student
        markMessagesAsRead(studentName);

        messageInput.value = '';
    }
}

// Function to mark messages as read for a specific student
function markMessagesAsRead(studentName) {
    messagesRef.orderByChild('sender').equalTo(studentName).once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            if (childSnapshot.val().status === 'Unread') {
                childSnapshot.ref.update({
                    status: 'Read'
                });
            }
        });

        // Update the student list
        displayStudentList();
    });
}

// Function to mark the current chat as treated
function markAsTreated() {
    var studentName = document.querySelector('.student-name').textContent;

    // Remove the treated student's chat from the database
    messagesRef.orderByChild('sender').equalTo(studentName).once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            childSnapshot.ref.remove();
        });

        // Clear the chat window
        document.getElementById('counselorChatMessages').innerHTML = '';

        // Update the student list
        displayStudentList();
    });
}

// Initial display of the student list
displayStudentList();
