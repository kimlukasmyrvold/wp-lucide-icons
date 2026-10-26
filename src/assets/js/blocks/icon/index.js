import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import '../../formats/inline-icon';

registerBlockType('wpicons/icon', {
    edit: Edit,
    save: () => null,
});
