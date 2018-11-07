#!/usr/bin/env python

from setuptools import setup

import beebeelog

setup(name='speedtest-logger',
      version=beebeelog.__version__,
      description="A broadband speedtest data logger",
      url='http://github.com/rm-hull/speedtest-logger',
      author='Richard Hull',
      author_email="richard.hull@destructuring-bind.org",
      license='MIT',
      packages=['beebeelog'],
      install_requires=['requests', 'speedtest-cli'],
      zip_safe=False)
