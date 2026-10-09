import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';

registerBlockType('wpicons/icon', {
    edit: Edit,
    save: () => null,
});
