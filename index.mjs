import { UmcBot } from './lib/umcBot';
import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost/bot_umc');

try {
    new UmcBot();
} catch (e) {
    console.error(e);
}
