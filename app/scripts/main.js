/*!
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
/* eslint-env browser */
(function() {
    'use strict';

    // Check to make sure service workers are supported in the current browser,
    // and that the current page is accessed from a secure origin. Using a
    // service worker from an insecure origin will trigger JS console errors. See
    // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
    var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
        // [::1] is the IPv6 localhost address.
        window.location.hostname === '[::1]' ||
        // 127.0.0.1/8 is considered localhost for IPv4.
        window.location.hostname.match(
            /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
        )
    );

    if ('serviceWorker' in navigator &&
        (window.location.protocol === 'https:' || isLocalhost)) {
        navigator.serviceWorker.register('service-worker.js')
            .then(function(registration) {
                // updatefound is fired if service-worker.js changes.
                registration.onupdatefound = function() {
                    // updatefound is also fired the very first time the SW is installed,
                    // and there's no need to prompt for a reload at that point.
                    // So check here to see if the page is already controlled,
                    // i.e. whether there's an existing service worker.
                    if (navigator.serviceWorker.controller) {
                        // The updatefound event implies that registration.installing is set:
                        // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
                        var installingWorker = registration.installing;

                        installingWorker.onstatechange = function() {
                            switch (installingWorker.state) {
                                case 'installed':
                                    // At this point, the old content will have been purged and the
                                    // fresh content will have been added to the cache.
                                    // It's the perfect time to display a "New content is
                                    // available; please refresh." message in the page's interface.
                                    break;

                                case 'redundant':
                                    throw new Error('The installing ' +
                                        'service worker became redundant.');

                                default:
                                    // Ignore
                            }
                        };
                    }
                };
            }).catch(function(e) {
                console.error('Error during service worker registration:', e);
            });
    }

    // Your custom JavaScript goes here

    let paciente = {};
    let schedules;

    document.addEventListener('DOMContentLoaded', function() {
        window.localforage.getItem('userValid').then(function(jwtoken) {
            if (!jwtoken)
                window.location = '/siss_web_app/app/login.html';


            let URL = 'http://saudeservicosbeta.barueri.sp.gov.br/SaudeAPI/api/v1/pessoa/obter';
            var xmlhttp = new XMLHttpRequest();
            //xmlhttp.onreadystatechange = callbackFunction(xmlhttp);
            xmlhttp.open('GET', URL, false);
            //xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xmlhttp.setRequestHeader('Authorization', 'Bearer ' + jwtoken);
            //xmlhttp.setRequestHeader('Authorization', 'Basic ' + window.btoa('apiusername:apiuserpassword')); //in prod, you should encrypt user name and password and provide encrypted keys here instead
            //xmlhttp.onreadystatechange = callbackFunction(xmlhttp);
            xmlhttp.send();
            let r = JSON.parse(xmlhttp.responseText);

            if (r.resultado) {
                paciente = r.object;
                document.querySelector('.Name').textContent = paciente.nome;
                loadSchedulingHistory(jwtoken);
            } else {
                console.log(r.mensagem);
            }
        });
    });

    const loadSchedulingHistory = function(jwtoken) {

        updateFromCache(function() {
            const url = 'http://saudeservicosbeta.barueri.sp.gov.br/SaudeAPI/api/v1/agenda/historico';
            const xmlhttp = new XMLHttpRequest();
            xmlhttp.open('GET', url, false);
            xmlhttp.setRequestHeader('Authorization', 'Bearer ' + jwtoken);
            xmlhttp.send();
            let r = JSON.parse(xmlhttp.responseText);
            if (r.resultado) {
                schedules = r.object;
                window.localforage.setItem('schedules', schedules).then(function(value) {
                    updateSchedulesCard(schedules);
                }).catch(function(err) {
                    // This code runs if there were any errors
                    console.log(err);
                });
            } else {
                console.log(r.mensagem);
            }
        });
    }

    const updateFromCache = function(callbackFunction) {
        window.localforage.getItem('schedules').then(function(schedules) {
            if (schedules)
                updateSchedulesCard(schedules);

            callbackFunction();
        });
    }

    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Agosto', 'Setembro', 'Novembro', 'Dezembro']

    const updateSchedulesCard = function(schedules) {
        document.getElementById('divSchedulesCards').innerHTML = '';
        schedules.forEach(function(schedule) {

            let data = new Date(schedule.dataHora);
            console.log(data);
            let hour = data.getHours();
            if (hour.toString().length == 1)
                hour = '0' + hour;

            let minutes = data.getMinutes();
            if (minutes.toString().length == 1)
                minutes = '0' + minutes;

            let html = '<div class="demo-card-event mdl-card mdl-cell mdl-cell--3-col mdl-cell--4-col-tablet mdl-cell--4-col-phone mdl-shadow--2dp">';
            html += '<div class="mdl-card__title mdl-card--expand mdl-card--no-padding-top-bottom">';
            html += '<h5 class="mdl-card--title-h5">';
            html += '<i class="material-icons mdl-color-text--teal-600">loyalty</i>' + schedule.especialidade + ' <br>';
            html += '<i class="material-icons mdl-color-text--teal-600">place</i> <small class="mdl-card-title--small">' + schedule.estabelecimento + '</small><br>';
            html += '<i class="material-icons mdl-color-text--teal-600">event</i> ' + data.getDate() + ' ' + months[data.getMonth()] + ', ' + data.getFullYear() + ' ' + hour + ':' + minutes;
            html += '</h5>';
            html += '</div>';
            html += '<div class="mdl-card__actions mdl-card--border">';
            html += '<a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect mdl-button--action-card mdl-color--teal-600 mdl-color-text--blue-grey-50">';
            html += 'Cancelar o Agendamento';
            html += '<i class="material-icons">cancel</i>';
            html += '</a>';
            html += '</div>';
            html += '</div>';

            document.getElementById('divSchedulesCards').innerHTML += html;
        }, this);

        componentHandler.upgradeAllRegistered();
    }

})();