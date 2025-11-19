import React, { Fragment } from 'react';
import EscrowTypeSelectorDialog from './EscrowTypeSelectorDialog';
import FeedbackDialog from '@/modules/feedback/components/FeedbackDialog';

export default function DialogPortal() {
  return (
    <Fragment>
      <EscrowTypeSelectorDialog />
      <FeedbackDialog />
    </Fragment>
  );
}
