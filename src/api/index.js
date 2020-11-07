import { version } from '../../package.json';
import { response, Router } from 'express';
import { carbonFootprint } from 'trip-to-carbon-xyz';
import "core-js/stable";
import "regenerator-runtime/runtime";
import facets from './facets';

const calculateFootPrint = async(req, res, next) => {
    let footPrint;
    const { amount, mode} = req.query;
    try {
        footPrint = await carbonFootprint({
            token: 'YourAppToken', // optional
            country: 'def',
            distance: {
                amount: amount,
                unit: 'miles',
                mode: mode
            }
        });

        if (footPrint == null) {
            return res.status(404).json({ message: "Cannot find the footprint" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.footPrint = footPrint;
    next();
}


export default (config, db) => {
    let api = Router();

    api.get('/calculate', calculateFootPrint, (req, res) => {
        res.json(res.footPrint);
    });

    api.use('/facets', facets({ config, db }));

    // perhaps expose some API metadata at the root
    api.get('/', (req, res) => {
        res.json({ version });
    });

    return api;
}