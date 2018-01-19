// this script is run during prebuild phase, see package.json
// Ultimately, this script should not be needed

import * as fs from 'fs';
import {prepare} from '@gramps/gramps'
import XKCD from './data-source-xkcd'
import Numbers from './data-source-numbers'
import Mock_A from './data-source-mock-a'
import Mock_B from './data-source-mock-b'
import Mock_C from './data-source-mock-c'
import {printSchema} from 'graphql'

// add new data sources here 
const gramps = prepare({ dataSources: [
    XKCD, Numbers, Mock_A, Mock_B, Mock_C
]})

fs.writeFileSync('./src/generated/gramps.graphql', printSchema(gramps.schema))
