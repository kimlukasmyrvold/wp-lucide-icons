import { __ } from '@wordpress/i18n';
import { Modal } from '@wordpress/components';
import IconPicker from '../picker/IconPicker';

export default function IconPickerModal({
    library,
    name,
    onLibraryChange,
    onSelect,
    onClose,
}) {
    return (
        <Modal
            title={__('Choose icon', 'wpicons')}
            onRequestClose={onClose}
            className="wpicons wpicons__picker-modal"
            isFullScreen={false}
        >
            <IconPicker
                library={library}
                name={name}
                onLibraryChange={onLibraryChange}
                onSelect={onSelect}
            />
        </Modal>
    );
}
