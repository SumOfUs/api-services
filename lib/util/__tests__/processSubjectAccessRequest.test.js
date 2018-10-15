import { SARconstructor } from '../processSubjectAccessRequest';
import path from 'path';

const zipCSVFiles = jest.fn();
const sendEmail = jest.fn();
const shipToS3 = jest.fn();

describe('process subject access requests', function() {
  zipCSVFiles.mockReturnValue(Promise.resolve('/path/to/zip/file.zip'));

  sendEmail.mockReturnValue(
    Promise.resolve({
      MessageId: 'EXAMPLE78603177f-7a5433e7-8edb-42ae-af10-f0181f34d6ee-000000',
    })
  );

  shipToS3.mockReturnValue(Promise.resolve('www.bogus-url.com'));

  const champaignMockData = {
    data: {
      actions: [{ id: 213, member_id: 123 }, { id: 234, member_id: 435 }],
    },
  };

  const processSubjectAccessRequest = SARconstructor(
    zipCSVFiles,
    shipToS3,
    sendEmail
  );

  test('zips the csv files, sends the zip file to s3 and emails member services', function() {
    processSubjectAccessRequest(
      champaignMockData,
      'champaign',
      'foo@example.com'
    ).then(function(res) {
      expect(zipCSVFiles).toHaveBeenCalledWith(
        path.join(__dirname, '../tmp'),
        'foo@example.com-champaign.zip'
      );
      expect(shipToS3).toHaveBeenCalledWith(
        '/path/to/zip/file.zip',
        'subject-access-requests'
      );
      expect(sendEmail).toHaveBeenCalledWith(
        'www.bogus-url.com',
        'info@example.com',
        'foo@example.com',
        'champaign'
      );
    });
  });
});
