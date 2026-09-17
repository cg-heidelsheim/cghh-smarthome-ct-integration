import moment from '../../util/timezone.bootstrap';

export class Lock {

    /** HMIP group ID */
    id!: string;
    /** UTC Timestamp as string */
    expiring!: string;
    eventName!: string;

    /**
     * Check if lock is expired.
     * Locks are expired if current date is after expiration date
     */
    isExpired = (): boolean => {
        const currentTime = moment();
        const expiryDate = moment(this.expiring);

        return currentTime.isAfter(expiryDate);
    };
}
