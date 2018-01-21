// this script is run during prebuild phase, see package.json
// Ultimately, this script should not be needed

import * as fs from 'fs';
import {prepare} from '@gramps/gramps'
import XKCD from './data-source-xkcd'
import Numbers from './data-source-numbers'
import Mock from './data-source-mock'
import {printSchema} from 'graphql'

// add new data sources here 
const gramps = prepare({ dataSources: [
    XKCD, Numbers, Mock
]})

fs.writeFileSync('./src/generated/gramps.graphql', printSchema(gramps.schema))
