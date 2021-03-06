SpeedTest Logger
================
.. image:: https://travis-ci.org/rm-hull/speedtest-logger.svg?branch=master
   :target: https://travis-ci.org/rm-hull/speedtest-logger

Performs a background broadband speed test, and then uploads the results to a 
https://api.thingspeak.com channel. For best (most realistic) performance, this 
ought to be run on a wired ethernet connection rather than over a WIFI connection.

.. image:: screenshot.png?raw=true 

Installing
----------
Ensure you have a recent version of ``pipenv`` installed (possibly ``pyenv`` too). 
Run ``pipenv sync`` to install all the necessary requirements.

Edit the ``beebeelog/config.py`` and set the **api_key** with the correct value obtained
from your channel configuration on https://www.thingspeak.com.

Running
-------
Run ``pipenv run python beebeelog/check_speed.py``. Use crontab to automate this to
execute on a scheduled basis.

TODO
----
* Systemd service definition

License
-------

The MIT License (MIT)

Copyright (c) 2018 Richard Hull

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
