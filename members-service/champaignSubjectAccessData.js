//- ChampaignSubjectAccess lambda - checks operations log table for updates / inserts that have event type SubjectAccessRequest
//-> makes a request to the champ endpoint to get the data
//-> marshals it into CVS
//-> compresses and uploads to s3 bucket
//-> updates the operations log table (Champaign - success)
