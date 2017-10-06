document.addEventListener("DOMContentLoaded", function() {

    // Listening for input changes
    document.addEventListener("focus", function(e) {
        checkTextfieldInput(e.target);
    }, true);
    document.addEventListener("change", function(e) {
        checkTextfieldInput(e.target);
    }, true);
    document.addEventListener("input", function(e) {
        checkTextfieldInput(e.target);
    }, true);
    document.addEventListener("blur", function(e) {
        checkTextfieldInput(e.target);
    }, true);

    // Initializing inputs
    var inputs = document.getElementsByClassName("mdl-textfield__input");
    for (var i = 0; i < inputs.length; i++) {
        checkTextfieldInput(inputs[i]);
    }

    document.querySelector('#btnLogin').addEventListener("click", login);

});

function checkTextfieldInput(input) {
    // Getiing the input and the textfield
    if (input instanceof Element && input.matches(".mdl-textfield__input") === true) {
        var field = input.closest(".mdl-textfield"),
            hasValue = input.value.toString().length !== 0;
        // If textfield found
        if (field !== null) {
            // Modifying icons
            var icons = field.getElementsByClassName("mdl-textfield__icon");
            for (var i = 0; i < icons.length; i++) {
                // If no value
                if (hasValue === false && input.isActive() !== true) {
                    icons[i].classList.remove("mdl-color-text--primary");
                }
                // Else if focus or value
                else {
                    icons[i].classList.add("mdl-color-text--primary");
                    console.log(hasValue, input.isActive())
                }
            }
        }
    }
}

// Closest
Element.prototype.closest = function(selector) {
    // If is what we're looking for
    if (this.matches(selector) === true) {
        // Return element
        return this;
    }
    // Else
    else {
        // If parent is a valid element
        var parent = this.parentNode;
        if (parent instanceof Element) {
            // Checking parent node
            return parent.closest(selector);
        }
        // Else
        else {
            // Nothing matches
            parent = null;
        }
        return parent;
    }
};

// Is active
Element.prototype.isActive = function() {
    return this === document.activeElement;
};

function login() {
    let cartao = document.getElementById('txtCartao').value;
    let URL = "http://saudeservicosbeta.barueri.sp.gov.br/SaudeAPI/token";
    var params = "grant_type=password&username=" + cartao;
    var xmlhttp = new XMLHttpRequest();
    //xmlhttp.onreadystatechange = callbackFunction(xmlhttp);
    xmlhttp.open("POST", URL, false);
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    //xmlhttp.setRequestHeader('Authorization', 'Basic ' + window.btoa('apiusername:apiuserpassword')); //in prod, you should encrypt user name and password and provide encrypted keys here instead 
    //xmlhttp.onreadystatechange = callbackFunction(xmlhttp);
    xmlhttp.send(params);
    let result = JSON.parse(xmlhttp.responseText);
    window.localforage.setItem('userValid', result.access_token).then(function(value) {
        // Do other things once the value has been saved.
        console.log(value);
        window.location = '/index.html';
    }).catch(function(err) {
        // This code runs if there were any errors
        console.log(err);
    });
}