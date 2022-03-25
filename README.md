# WeClocked

WeClocked is a tool to facilitate low to no-code analysis of working-related data collected through the [WeClock](https://gitlab.com/weclock) app. 

## Goals
[WeClock](https://weclock.it) is a tool that makes it easy for workers to collect data that can be used to calculate useful things about their working life: hours worked, locations visited, motion and steps, etc. Right now, analysis of this data into something useful or communicable is really only done by a small group of data scientists. 

The goal of this project is to make analyzing and producing useful content from WeClock data more accessible to laypeople, including workers who want to investigate their own data, and organizers who want to aggregate multiple workers' data exports. 

## Current Status
The tool is currently under development. 

- 3/25/22: Can upload a parsed WeClock export to Google Sheets. Some basic tests and other infrastructure.

Some near-future features:

- [ ] Upload multiple `data.csv` exports from different users or from your own device
- [ ] Tighter integration with google sheets or other back-ends (airtable, for example)
- [ ] Custom mapping and analysis code + utilities to make basic figures easier to create
- [ ] Data access and management
- [ ] Auditing and logging of actions done to data uploaded using the tool and access logs

## Tooling

WeClocked is built using [Solidjs](https://www.solidjs.com) and [Flask](https://flask.palletsprojects.com/en/2.0.x/). No database is needed (yet).

Testing is done using [pytest](https://docs.pytest.org/en/7.1.x/) and [uvu](https://github.com/lukeed/uvu).

## License
MIT
