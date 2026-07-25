from django.db import models
class User(models.Model):
    user_id = models.AutoField(primary_key=True)
    full_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    phone = models.CharField(max_length=15, blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    height = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    activity_level = models.CharField(max_length=30, blank=True, null=True)
    goal = models.CharField(max_length=30, blank=True, null=True)
    profile_image = models.CharField(max_length=255, default="default.png")
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    status = models.CharField(max_length=20)

    class Meta:
        db_table = "users"
        managed = False

    def __str__(self):
        return self.full_name