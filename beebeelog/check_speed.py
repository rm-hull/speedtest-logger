#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# The MIT License (MIT)
#
# Copyright (c) 2018 Richard Hull
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

import sys
import speedtest
import json
import requests

import config

MB = 1024 * 1024


class thing_speak(object):
    def __init__(self, api_key):
        self._api_key = api_key

    def persist(self, results):
        payload = {
            "api_key": self._api_key,
            "field1": round(results.download / MB, 3),
            "field2": round(results.upload / MB, 3),
            "field3": results.ping
        }
        return requests.post("https://api.thingspeak.com/update", payload)


if __name__ == "__main__":
    s = speedtest.Speedtest()
    s.get_best_server()
    s.download()
    s.upload()

    print(json.dumps(s.results.dict()))

    ts = thing_speak(config.api_key)
    resp = ts.persist(s.results)
    if resp.status_code != 200:
        print('*** Unexpected ThingSpeak HTTP response status: {}'.format(resp.status_code))
        sys.exit(1)
