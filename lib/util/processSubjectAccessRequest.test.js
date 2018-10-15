jest.mock('./shipToS3');
jest.mock('./zipCSVFiles');

import { shipToS3 } from './shipToS3';
import { zipCSVFiles } from './zipCSVFiles';
import { processSubjectAccessRequest } from './processSubjectAccessRequest';

describe('process subject access requests', function() {
  const champaignMockData = {
    data: {
      actions: [{ id: 213, member_id: 123 }, { id: 234, member_id: 435 }],
    },
  };

  test('marshals json results to csv format', function() {
    processSubjectAccessRequest(
      champaignMockData,
      'champaign',
      'foo@example.com'
    ).then(function(res) {
      expect(zipCSVFiles).toHaveBeenCalledWith(
        'path',
        'foo@example.com-champaign.zip'
      );
    });
  });
  test('zips the csv files', function() {});
  test('sends the zip file to s3', function() {});
  test('emails member services', function() {});
});
